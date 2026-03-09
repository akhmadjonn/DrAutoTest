using DrAutoTest.Domain.Enums;

namespace DrAutoTest.Domain.Entities;

public class Payment : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid SubscriptionId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "UZS";
    public PaymentProvider Provider { get; set; }
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public string? ExternalTransactionId { get; set; }
    public string? ProviderData { get; set; }
    public DateTime? CompletedAt { get; set; }

    public User User { get; set; } = null!;
    public Subscription Subscription { get; set; } = null!;
}
