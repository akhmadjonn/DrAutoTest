using DrAutoTest.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DrAutoTest.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;
    private readonly ILogger<PaymentsController> _logger;

    public PaymentsController(IPaymentService paymentService, ILogger<PaymentsController> logger)
    {
        _paymentService = paymentService;
        _logger = logger;
    }

    [HttpPost("payme/callback")]
    public async Task<ActionResult> PaymeCallback(CancellationToken cancellationToken)
    {
        using var reader = new StreamReader(Request.Body);
        var payload = await reader.ReadToEndAsync(cancellationToken);

        _logger.LogInformation("Payme callback received");

        var result = await _paymentService.ProcessPaymeCallbackAsync(payload, cancellationToken);
        return result ? Ok() : BadRequest();
    }

    [HttpPost("click/callback")]
    public async Task<ActionResult> ClickCallback(CancellationToken cancellationToken)
    {
        using var reader = new StreamReader(Request.Body);
        var payload = await reader.ReadToEndAsync(cancellationToken);

        _logger.LogInformation("Click callback received");

        var result = await _paymentService.ProcessClickCallbackAsync(payload, cancellationToken);
        return result ? Ok() : BadRequest();
    }

    [HttpPost("stripe/webhook")]
    public async Task<ActionResult> StripeWebhook(CancellationToken cancellationToken)
    {
        using var reader = new StreamReader(Request.Body);
        var payload = await reader.ReadToEndAsync(cancellationToken);
        var signature = Request.Headers["Stripe-Signature"].ToString();

        _logger.LogInformation("Stripe webhook received");

        var result = await _paymentService.ProcessStripeWebhookAsync(payload, signature, cancellationToken);
        return result ? Ok() : BadRequest();
    }
}
