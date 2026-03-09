using System.Security.Claims;
using DrAutoTest.Application.DTOs.Common;
using DrAutoTest.Application.DTOs.Exams;
using DrAutoTest.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DrAutoTest.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ExamsController : ControllerBase
{
    private readonly IExamService _examService;

    public ExamsController(IExamService examService)
    {
        _examService = examService;
    }

    [HttpPost("start")]
    public async Task<ActionResult<ExamDto>> Start(
        [FromBody] StartExamRequest request,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var result = await _examService.StartExamAsync(userId, request, cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = result.Id }, result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ExamDto>> Get(Guid id, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var result = await _examService.GetExamAsync(userId, id, cancellationToken);
        return Ok(result);
    }

    [HttpPost("answer")]
    public async Task<ActionResult<ExamQuestionDto>> SubmitAnswer(
        [FromBody] SubmitAnswerRequest request,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var result = await _examService.SubmitAnswerAsync(userId, request, cancellationToken);
        return Ok(result);
    }

    [HttpPost("{id:guid}/finish")]
    public async Task<ActionResult<ExamResultDto>> Finish(Guid id, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var result = await _examService.FinishExamAsync(userId, id, cancellationToken);
        return Ok(result);
    }

    [HttpGet("history")]
    public async Task<ActionResult<PagedResponse<ExamDto>>> History(
        [FromQuery] PagedRequest request,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var result = await _examService.GetExamHistoryAsync(userId, request, cancellationToken);
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
