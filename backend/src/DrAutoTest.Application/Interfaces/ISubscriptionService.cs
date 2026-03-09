using DrAutoTest.Application.DTOs.Subscriptions;

namespace DrAutoTest.Application.Interfaces;

public interface ISubscriptionService
{
    Task<List<SubscriptionPlanDto>> GetPlansAsync(CancellationToken cancellationToken = default);
    Task<SubscriptionDto> SubscribeAsync(Guid userId, SubscribeRequest request, CancellationToken cancellationToken = default);
    Task<SubscriptionDto?> GetCurrentAsync(Guid userId, CancellationToken cancellationToken = default);
    Task CheckAndExpireAsync(CancellationToken cancellationToken = default);
}
