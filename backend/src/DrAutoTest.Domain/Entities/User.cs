using DrAutoTest.Domain.Enums;

namespace DrAutoTest.Domain.Entities;

public class User : BaseEntity
{
    public string? PhoneNumber { get; set; }
    public string? Email { get; set; }
    public string? PasswordHash { get; set; }
    public string FullName { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.User;
    public bool IsEmailVerified { get; set; }
    public bool IsPhoneVerified { get; set; }
    public string? ProfileImageUrl { get; set; }

    public ICollection<Exam> Exams { get; set; } = new List<Exam>();
    public ICollection<UserProgress> UserProgress { get; set; } = new List<UserProgress>();
    public ICollection<Subscription> Subscriptions { get; set; } = new List<Subscription>();
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
