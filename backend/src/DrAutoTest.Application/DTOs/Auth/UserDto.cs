using DrAutoTest.Domain.Enums;

namespace DrAutoTest.Application.DTOs.Auth;

public class UserDto
{
    public Guid Id { get; set; }
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string FullName { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public string? ProfileImageUrl { get; set; }
    public SubscriptionStatus? SubscriptionStatus { get; set; }
}
