namespace DrAutoTest.Application.Interfaces;

public interface IPaymentService
{
    Task<bool> ProcessPaymeCallbackAsync(string payload, CancellationToken cancellationToken = default);
    Task<bool> ProcessClickCallbackAsync(string payload, CancellationToken cancellationToken = default);
    Task<bool> ProcessStripeWebhookAsync(string payload, string signature, CancellationToken cancellationToken = default);
}
