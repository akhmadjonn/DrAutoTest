using System.Security.Claims;
using DrAutoTest.Application.DTOs.Progress;
using DrAutoTest.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DrAutoTest.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProgressController : ControllerBase
{
    private readonly IProgressService _progressService;

    public ProgressController(IProgressService progressService)
    {
        _progressService = progressService;
    }

    [HttpGet("summary")]
    public async Task<ActionResult<ProgressSummaryDto>> GetSummary(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var result = await _progressService.GetSummaryAsync(userId, cancellationToken);
        return Ok(result);
    }

    [HttpGet("categories")]
    public async Task<ActionResult<List<CategoryProgressDto>>> GetCategoryProgress(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var result = await _progressService.GetCategoryProgressAsync(userId, cancellationToken);
        return Ok(result);
    }

    [HttpGet("weak-areas")]
    public async Task<ActionResult<List<WeakAreaDto>>> GetWeakAreas(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var result = await _progressService.GetWeakAreasAsync(userId, cancellationToken);
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
