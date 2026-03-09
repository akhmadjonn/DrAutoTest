using DrAutoTest.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace DrAutoTest.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;

    public EmailService(ILogger<EmailService> logger)
    {
        _logger = logger;
    }

    public Task<bool> SendEmailAsync(string to, string subject, string body, CancellationToken cancellationToken = default)
    {
        // In production, integrate with an email provider such as SendGrid, AWS SES, or SMTP.
        // This implementation logs the email for development purposes.
        _logger.LogInformation(
            "Email sent to {To} | Subject: {Subject} | Body: {Body}",
            to,
            subject,
            body);

        return Task.FromResult(true);
    }
}
