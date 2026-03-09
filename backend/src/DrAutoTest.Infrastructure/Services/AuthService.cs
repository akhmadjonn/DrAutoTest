using System.Security.Claims;
using AutoMapper;
using DrAutoTest.Application.DTOs.Auth;
using DrAutoTest.Application.Interfaces;
using DrAutoTest.Domain.Entities;
using DrAutoTest.Domain.Enums;
using DrAutoTest.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace DrAutoTest.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly IRepository<User> _userRepository;
    private readonly IRepository<RefreshToken> _refreshTokenRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITokenService _tokenService;
    private readonly ICacheService _cacheService;
    private readonly ISmsService _smsService;
    private readonly IEmailService _emailService;
    private readonly IMapper _mapper;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IRepository<User> userRepository,
        IRepository<RefreshToken> refreshTokenRepository,
        IUnitOfWork unitOfWork,
        ITokenService tokenService,
        ICacheService cacheService,
        ISmsService smsService,
        IEmailService emailService,
        IMapper mapper,
        IConfiguration configuration,
        ILogger<AuthService> logger)
    {
        _userRepository = userRepository;
        _refreshTokenRepository = refreshTokenRepository;
        _unitOfWork = unitOfWork;
        _tokenService = tokenService;
        _cacheService = cacheService;
        _smsService = smsService;
        _emailService = emailService;
        _mapper = mapper;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<bool> SendOtpAsync(SendOtpRequest request, CancellationToken cancellationToken = default)
    {
        var otp = GenerateOtp();
        var cacheKey = $"otp:{request.OtpType}:{request.PhoneOrEmail}";

        await _cacheService.SetAsync(cacheKey, otp, TimeSpan.FromMinutes(5), cancellationToken);

        if (request.OtpType == OtpType.Sms)
        {
            var message = $"Your DrAutoTest verification code is: {otp}. Valid for 5 minutes.";
            await _smsService.SendSmsAsync(request.PhoneOrEmail, message, cancellationToken);
        }
        else
        {
            var subject = "DrAutoTest - Verification Code";
            var body = $"Your verification code is: {otp}. This code is valid for 5 minutes.";
            await _emailService.SendEmailAsync(request.PhoneOrEmail, subject, body, cancellationToken);
        }

        _logger.LogInformation("OTP sent to {Destination} via {Type}", request.PhoneOrEmail, request.OtpType);
        return true;
    }

    public async Task<AuthResponse> VerifyOtpAsync(VerifyOtpRequest request, CancellationToken cancellationToken = default)
    {
        var cacheKey = $"otp:{request.OtpType}:{request.PhoneOrEmail}";
        var storedOtp = await _cacheService.GetAsync<string>(cacheKey, cancellationToken);

        if (storedOtp == null || storedOtp != request.Code)
        {
            throw new UnauthorizedAccessException("Invalid or expired OTP code.");
        }

        await _cacheService.RemoveAsync(cacheKey, cancellationToken);

        User? user;
        if (request.OtpType == OtpType.Sms)
        {
            user = await _userRepository.FirstOrDefaultAsync(
                u => u.PhoneNumber == request.PhoneOrEmail, cancellationToken);

            if (user == null)
            {
                user = new User
                {
                    PhoneNumber = request.PhoneOrEmail,
                    IsPhoneVerified = true,
                    FullName = "User"
                };
                await _userRepository.AddAsync(user, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
            }
            else
            {
                user.IsPhoneVerified = true;
                await _userRepository.UpdateAsync(user, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
            }
        }
        else
        {
            user = await _userRepository.FirstOrDefaultAsync(
                u => u.Email == request.PhoneOrEmail, cancellationToken);

            if (user == null)
            {
                throw new UnauthorizedAccessException("No account found with this email. Please register first.");
            }

            user.IsEmailVerified = true;
            await _userRepository.UpdateAsync(user, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        return await GenerateAuthResponseAsync(user, cancellationToken);
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        var existingUser = await _userRepository.FirstOrDefaultAsync(
            u => u.Email == request.Email, cancellationToken);

        if (existingUser != null)
        {
            throw new InvalidOperationException("A user with this email already exists.");
        }

        var user = new User
        {
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FullName = request.FullName,
            Role = UserRole.User
        };

        await _userRepository.AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("New user registered: {Email}", request.Email);

        return await GenerateAuthResponseAsync(user, cancellationToken);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.FirstOrDefaultAsync(
            u => u.Email == request.Email, cancellationToken);

        if (user == null || string.IsNullOrEmpty(user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        _logger.LogInformation("User logged in: {Email}", request.Email);

        return await GenerateAuthResponseAsync(user, cancellationToken);
    }

    public async Task<AuthResponse> RefreshTokenAsync(RefreshTokenRequest request, CancellationToken cancellationToken = default)
    {
        var storedToken = await _refreshTokenRepository.FirstOrDefaultAsync(
            rt => rt.Token == request.RefreshToken, cancellationToken);

        if (storedToken == null)
        {
            throw new UnauthorizedAccessException("Invalid refresh token.");
        }

        if (storedToken.IsRevoked)
        {
            _logger.LogWarning("Attempt to use revoked refresh token for user {UserId}", storedToken.UserId);
            throw new UnauthorizedAccessException("Token has been revoked.");
        }

        if (storedToken.IsExpired)
        {
            throw new UnauthorizedAccessException("Refresh token has expired.");
        }

        var user = await _userRepository.GetByIdAsync(storedToken.UserId, cancellationToken);
        if (user == null)
        {
            throw new UnauthorizedAccessException("User not found.");
        }

        storedToken.RevokedAt = DateTime.UtcNow;
        var newRefreshTokenValue = _tokenService.GenerateRefreshToken();
        storedToken.ReplacedByToken = newRefreshTokenValue;
        await _refreshTokenRepository.UpdateAsync(storedToken, cancellationToken);

        var newRefreshToken = new RefreshToken
        {
            UserId = user.Id,
            Token = newRefreshTokenValue,
            ExpiresAt = DateTime.UtcNow.AddDays(
                int.Parse(_configuration["JwtSettings:RefreshTokenExpirationDays"] ?? "7")),
        };
        await _refreshTokenRepository.AddAsync(newRefreshToken, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var accessToken = _tokenService.GenerateAccessToken(user);
        var expiresMinutes = int.Parse(
            _configuration["JwtSettings:AccessTokenExpirationMinutes"] ?? "60");

        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = newRefreshTokenValue,
            ExpiresAt = DateTime.UtcNow.AddMinutes(expiresMinutes),
            User = _mapper.Map<UserDto>(user)
        };
    }

    public async Task<AuthResponse> GoogleLoginAsync(string idToken, CancellationToken cancellationToken = default)
    {
        var email = await ValidateGoogleTokenAsync(idToken);
        if (string.IsNullOrEmpty(email))
        {
            throw new UnauthorizedAccessException("Invalid Google token.");
        }

        var user = await _userRepository.FirstOrDefaultAsync(
            u => u.Email == email, cancellationToken);

        if (user == null)
        {
            user = new User
            {
                Email = email,
                FullName = email.Split('@')[0],
                IsEmailVerified = true,
                Role = UserRole.User
            };
            await _userRepository.AddAsync(user, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("New user registered via Google: {Email}", email);
        }

        return await GenerateAuthResponseAsync(user, cancellationToken);
    }

    public async Task<UserDto> GetCurrentUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        if (user == null)
        {
            throw new KeyNotFoundException("User not found.");
        }

        return _mapper.Map<UserDto>(user);
    }

    private async Task<AuthResponse> GenerateAuthResponseAsync(User user, CancellationToken cancellationToken)
    {
        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshTokenValue = _tokenService.GenerateRefreshToken();

        var refreshTokenDays = int.Parse(
            _configuration["JwtSettings:RefreshTokenExpirationDays"] ?? "7");
        var accessTokenMinutes = int.Parse(
            _configuration["JwtSettings:AccessTokenExpirationMinutes"] ?? "60");

        var refreshToken = new RefreshToken
        {
            UserId = user.Id,
            Token = refreshTokenValue,
            ExpiresAt = DateTime.UtcNow.AddDays(refreshTokenDays),
        };

        await _refreshTokenRepository.AddAsync(refreshToken, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshTokenValue,
            ExpiresAt = DateTime.UtcNow.AddMinutes(accessTokenMinutes),
            User = _mapper.Map<UserDto>(user)
        };
    }

    private static string GenerateOtp()
    {
        var random = new Random();
        return random.Next(100000, 999999).ToString();
    }

    private Task<string?> ValidateGoogleTokenAsync(string idToken)
    {
        // In production, validate against Google's tokeninfo endpoint:
        // https://oauth2.googleapis.com/tokeninfo?id_token={idToken}
        // For now, decode the JWT payload to extract the email claim.
        try
        {
            var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(idToken) as System.IdentityModel.Tokens.Jwt.JwtSecurityToken;
            var email = jsonToken?.Claims.FirstOrDefault(c => c.Type == "email")?.Value;
            return Task.FromResult(email);
        }
        catch
        {
            return Task.FromResult<string?>(null);
        }
    }
}
