using DrAutoTest.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace DrAutoTest.Infrastructure.Services;

public class SmsService : ISmsService
{
    private readonly ILogger<SmsService> _logger;

    public SmsService(ILogger<SmsService> logger)
    {
        _logger = logger;
    }

    public Task<bool> SendSmsAsync(string phoneNumber, string message, CancellationToken cancellationToken = default)
    {
        // In production, integrate with an SMS provider such as Eskiz.uz, Twilio, or similar.
        // This implementation logs the message for development purposes.
        _logger.LogInformation(
            "SMS sent to {PhoneNumber}: {Message}",
            phoneNumber,
            message);

        return Task.FromResult(true);
    }
}
