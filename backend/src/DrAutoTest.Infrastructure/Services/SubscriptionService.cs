using AutoMapper;
using DrAutoTest.Application.DTOs.Subscriptions;
using DrAutoTest.Application.Interfaces;
using DrAutoTest.Domain.Entities;
using DrAutoTest.Domain.Enums;
using DrAutoTest.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DrAutoTest.Infrastructure.Services;

public class SubscriptionService : ISubscriptionService
{
    private readonly IRepository<Subscription> _subscriptionRepository;
    private readonly IRepository<SubscriptionPlan> _planRepository;
    private readonly IRepository<Payment> _paymentRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<SubscriptionService> _logger;

    public SubscriptionService(
        IRepository<Subscription> subscriptionRepository,
        IRepository<SubscriptionPlan> planRepository,
        IRepository<Payment> paymentRepository,
        IUnitOfWork unitOfWork,
        IMapper mapper,
        ILogger<SubscriptionService> logger)
    {
        _subscriptionRepository = subscriptionRepository;
        _planRepository = planRepository;
        _paymentRepository = paymentRepository;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<List<SubscriptionPlanDto>> GetPlansAsync(CancellationToken cancellationToken = default)
    {
        var plans = await _planRepository.Query()
            .Where(p => p.IsActive)
            .OrderBy(p => p.DisplayOrder)
            .ToListAsync(cancellationToken);

        return _mapper.Map<List<SubscriptionPlanDto>>(plans);
    }

    public async Task<SubscriptionDto> SubscribeAsync(Guid userId, SubscribeRequest request, CancellationToken cancellationToken = default)
    {
        var plan = await _planRepository.GetByIdAsync(request.PlanId, cancellationToken);
        if (plan == null || !plan.IsActive)
        {
            throw new KeyNotFoundException("Subscription plan not found or inactive.");
        }

        var existingActive = await _subscriptionRepository.FirstOrDefaultAsync(
            s => s.UserId == userId &&
                 (s.Status == SubscriptionStatus.Active || s.Status == SubscriptionStatus.Trial),
            cancellationToken);

        if (existingActive != null)
        {
            throw new InvalidOperationException("You already have an active subscription.");
        }

        var subscription = new Subscription
        {
            UserId = userId,
            PlanId = request.PlanId,
            Status = SubscriptionStatus.Active,
            StartsAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(plan.DurationDays)
        };

        await _subscriptionRepository.AddAsync(subscription, cancellationToken);

        var payment = new Payment
        {
            UserId = userId,
            SubscriptionId = subscription.Id,
            Amount = plan.Price,
            Currency = "UZS",
            Provider = request.PaymentProvider,
            Status = PaymentStatus.Pending
        };

        await _paymentRepository.AddAsync(payment, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} subscribed to plan {PlanId}", userId, request.PlanId);

        return await GetSubscriptionDtoAsync(subscription.Id, cancellationToken);
    }

    public async Task<SubscriptionDto?> GetCurrentAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var subscription = await _subscriptionRepository.Query()
            .Include(s => s.Plan)
            .Where(s => s.UserId == userId &&
                        (s.Status == SubscriptionStatus.Active || s.Status == SubscriptionStatus.Trial))
            .OrderByDescending(s => s.ExpiresAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (subscription == null)
        {
            return null;
        }

        return _mapper.Map<SubscriptionDto>(subscription);
    }

    public async Task CheckAndExpireAsync(CancellationToken cancellationToken = default)
    {
        var expiredSubscriptions = await _subscriptionRepository.Query()
            .Where(s => (s.Status == SubscriptionStatus.Active || s.Status == SubscriptionStatus.Trial)
                        && s.ExpiresAt <= DateTime.UtcNow)
            .ToListAsync(cancellationToken);

        foreach (var subscription in expiredSubscriptions)
        {
            subscription.Status = SubscriptionStatus.Expired;
            await _subscriptionRepository.UpdateAsync(subscription, cancellationToken);
        }

        if (expiredSubscriptions.Count > 0)
        {
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            _logger.LogInformation("Expired {Count} subscriptions", expiredSubscriptions.Count);
        }
    }

    private async Task<SubscriptionDto> GetSubscriptionDtoAsync(Guid subscriptionId, CancellationToken cancellationToken)
    {
        var subscription = await _subscriptionRepository.Query()
            .Include(s => s.Plan)
            .FirstOrDefaultAsync(s => s.Id == subscriptionId, cancellationToken);

        return _mapper.Map<SubscriptionDto>(subscription!);
    }
}
