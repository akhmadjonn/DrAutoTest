using System.Security.Claims;
using DrAutoTest.Application.DTOs.Subscriptions;
using DrAutoTest.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DrAutoTest.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SubscriptionsController : ControllerBase
{
    private readonly ISubscriptionService _subscriptionService;

    public SubscriptionsController(ISubscriptionService subscriptionService)
    {
        _subscriptionService = subscriptionService;
    }

    [HttpGet("plans")]
    [AllowAnonymous]
    public async Task<ActionResult<List<SubscriptionPlanDto>>> GetPlans(CancellationToken cancellationToken)
    {
        var result = await _subscriptionService.GetPlansAsync(cancellationToken);
        return Ok(result);
    }

    [HttpPost("subscribe")]
    public async Task<ActionResult<SubscriptionDto>> Subscribe(
        [FromBody] SubscribeRequest request,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var result = await _subscriptionService.SubscribeAsync(userId, request, cancellationToken);
        return Ok(result);
    }

    [HttpGet("current")]
    public async Task<ActionResult<SubscriptionDto>> GetCurrent(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var result = await _subscriptionService.GetCurrentAsync(userId, cancellationToken);
        if (result == null)
        {
            return Ok(new { active = false, message = "No active subscription." });
        }
        return Ok(result);
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException("Invalid user token.");
        }
        return userId;
    }
}
