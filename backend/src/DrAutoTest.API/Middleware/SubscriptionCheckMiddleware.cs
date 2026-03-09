using System.Security.Claims;
using DrAutoTest.Application.Interfaces;

namespace DrAutoTest.API.Middleware;

public class SubscriptionCheckMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<SubscriptionCheckMiddleware> _logger;

    private static readonly HashSet<string> PremiumPaths = new(StringComparer.OrdinalIgnoreCase)
    {
        "/api/exams/start",
        "/api/progress/summary",
        "/api/progress/categories",
        "/api/progress/weak-areas"
    };

    public SubscriptionCheckMiddleware(RequestDelegate next, ILogger<SubscriptionCheckMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, ISubscriptionService subscriptionService)
    {
        var path = context.Request.Path.Value;

        if (path != null && PremiumPaths.Any(p => path.StartsWith(p, StringComparison.OrdinalIgnoreCase)))
        {
            var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var userId))
            {
                var subscription = await subscriptionService.GetCurrentAsync(userId);
                if (subscription == null)
                {
                    _logger.LogWarning("User {UserId} attempted to access premium endpoint {Path} without subscription",
                        userId, path);

                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    context.Response.ContentType = "application/json";
                    await context.Response.WriteAsJsonAsync(new
                    {
                        status = 403,
                        title = "Subscription Required",
                        detail = "An active subscription is required to access this feature."
                    });
                    return;
                }
            }
        }

        await _next(context);
    }
}
