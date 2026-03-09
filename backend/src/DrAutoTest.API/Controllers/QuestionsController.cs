using DrAutoTest.Application.DTOs.Questions;
using DrAutoTest.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DrAutoTest.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class QuestionsController : ControllerBase
{
    private readonly IQuestionService _questionService;

    public QuestionsController(IQuestionService questionService)
    {
        _questionService = questionService;
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<QuestionDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _questionService.GetByIdAsync(id, cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<QuestionDto>> Create(
        [FromBody] CreateQuestionRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _questionService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<QuestionDto>> Update(
        Guid id,
        [FromBody] UpdateQuestionRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _questionService.UpdateAsync(id, request, cancellationToken);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _questionService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }

    [HttpPost("bulk-import")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult> BulkImport(
        [FromBody] List<CreateQuestionRequest> questions,
        CancellationToken cancellationToken)
    {
        var count = await _questionService.BulkImportAsync(questions, cancellationToken);
        return Ok(new { imported = count });
    }
}
