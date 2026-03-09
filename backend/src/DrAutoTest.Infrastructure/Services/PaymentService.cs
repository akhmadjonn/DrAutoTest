using System.Text.Json;
using DrAutoTest.Application.Interfaces;
using DrAutoTest.Domain.Entities;
using DrAutoTest.Domain.Enums;
using DrAutoTest.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace DrAutoTest.Infrastructure.Services;

public class PaymentService : IPaymentService
{
    private readonly IRepository<Payment> _paymentRepository;
    private readonly IRepository<Subscription> _subscriptionRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IConfiguration _configuration;
    private readonly ILogger<PaymentService> _logger;

    public PaymentService(
        IRepository<Payment> paymentRepository,
        IRepository<Subscription> subscriptionRepository,
        IUnitOfWork unitOfWork,
        IConfiguration configuration,
        ILogger<PaymentService> logger)
    {
        _paymentRepository = paymentRepository;
        _subscriptionRepository = subscriptionRepository;
        _unitOfWork = unitOfWork;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<bool> ProcessPaymeCallbackAsync(string payload, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Processing Payme callback");

        try
        {
            var data = JsonSerializer.Deserialize<JsonElement>(payload);
            var method = data.GetProperty("method").GetString();
            var transactionId = data.GetProperty("params").GetProperty("id").GetString();

            switch (method)
            {
                case "CheckPerformTransaction":
                    _logger.LogInformation("Payme CheckPerformTransaction for {TransactionId}", transactionId);
                    return true;

                case "CreateTransaction":
                    _logger.LogInformation("Payme CreateTransaction for {TransactionId}", transactionId);
                    return true;

                case "PerformTransaction":
                    _logger.LogInformation("Payme PerformTransaction for {TransactionId}", transactionId);
                    if (!string.IsNullOrEmpty(transactionId))
                    {
                        await CompletePaymentAsync(transactionId, PaymentProvider.Payme, cancellationToken);
                    }
                    return true;

                case "CancelTransaction":
                    _logger.LogInformation("Payme CancelTransaction for {TransactionId}", transactionId);
                    return true;

                default:
                    _logger.LogWarning("Unknown Payme method: {Method}", method);
                    return false;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing Payme callback");
            return false;
        }
    }

    public async Task<bool> ProcessClickCallbackAsync(string payload, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Processing Click callback");

        try
        {
            var data = JsonSerializer.Deserialize<JsonElement>(payload);
            var action = data.GetProperty("action").GetInt32();
            var transactionId = data.GetProperty("click_trans_id").GetString();

            switch (action)
            {
                case 0: // Prepare
                    _logger.LogInformation("Click Prepare for {TransactionId}", transactionId);
                    return true;

                case 1: // Complete
                    _logger.LogInformation("Click Complete for {TransactionId}", transactionId);
                    var error = data.TryGetProperty("error", out var errorElement) ? errorElement.GetInt32() : 0;
                    if (error == 0 && !string.IsNullOrEmpty(transactionId))
                    {
                        await CompletePaymentAsync(transactionId, PaymentProvider.Click, cancellationToken);
                    }
                    return true;

                default:
                    _logger.LogWarning("Unknown Click action: {Action}", action);
                    return false;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing Click callback");
            return false;
        }
    }

    public async Task<bool> ProcessStripeWebhookAsync(string payload, string signature, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Processing Stripe webhook");

        try
        {
            var stripeSecret = _configuration["PaymentSettings:Stripe:WebhookSecret"];
            // In production, verify signature using Stripe SDK:
            // var stripeEvent = EventUtility.ConstructEvent(payload, signature, stripeSecret);

            var data = JsonSerializer.Deserialize<JsonElement>(payload);
            var eventType = data.GetProperty("type").GetString();

            switch (eventType)
            {
                case "checkout.session.completed":
                    var sessionId = data.GetProperty("data").GetProperty("object").GetProperty("id").GetString();
                    _logger.LogInformation("Stripe checkout session completed: {SessionId}", sessionId);
                    if (!string.IsNullOrEmpty(sessionId))
                    {
                        await CompletePaymentAsync(sessionId, PaymentProvider.Stripe, cancellationToken);
                    }
                    return true;

                case "payment_intent.succeeded":
                    _logger.LogInformation("Stripe payment intent succeeded");
                    return true;

                case "payment_intent.payment_failed":
                    _logger.LogWarning("Stripe payment intent failed");
                    return true;

                default:
                    _logger.LogInformation("Unhandled Stripe event type: {EventType}", eventType);
                    return true;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing Stripe webhook");
            return false;
        }
    }

    private async Task CompletePaymentAsync(string externalTransactionId, PaymentProvider provider, CancellationToken cancellationToken)
    {
        var payment = await _paymentRepository.FirstOrDefaultAsync(
            p => p.ExternalTransactionId == externalTransactionId && p.Provider == provider,
            cancellationToken);

        if (payment == null)
        {
            _logger.LogWarning("Payment not found for transaction {TransactionId} ({Provider})",
                externalTransactionId, provider);
            return;
        }

        payment.Status = PaymentStatus.Completed;
        payment.CompletedAt = DateTime.UtcNow;
        await _paymentRepository.UpdateAsync(payment, cancellationToken);

        var subscription = await _subscriptionRepository.GetByIdAsync(payment.SubscriptionId, cancellationToken);
        if (subscription != null)
        {
            subscription.Status = SubscriptionStatus.Active;
            await _subscriptionRepository.UpdateAsync(subscription, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Payment {PaymentId} completed for subscription {SubscriptionId}",
            payment.Id, payment.SubscriptionId);
    }
}
