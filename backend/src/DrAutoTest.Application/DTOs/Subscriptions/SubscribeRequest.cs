using DrAutoTest.Domain.Enums;

namespace DrAutoTest.Application.DTOs.Subscriptions;

public class SubscribeRequest
{
    public Guid PlanId { get; set; }
    public PaymentProvider PaymentProvider { get; set; }
}
