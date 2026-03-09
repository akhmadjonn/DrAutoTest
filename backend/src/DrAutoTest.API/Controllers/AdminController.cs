using DrAutoTest.Application.DTOs.Common;
using DrAutoTest.Application.DTOs.Questions;
using DrAutoTest.Application.Interfaces;
using DrAutoTest.Domain.Entities;
using DrAutoTest.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DrAutoTest.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
public class AdminController : ControllerBase
{
    private readonly IRepository<User> _userRepository;
    private readonly IRepository<Exam> _examRepository;
    private readonly IRepository<Question> _questionRepository;
    private readonly IRepository<Subscription> _subscriptionRepository;
    private readonly IQuestionService _questionService;

    public AdminController(
        IRepository<User> userRepository,
        IRepository<Exam> examRepository,
        IRepository<Question> questionRepository,
        IRepository<Subscription> subscriptionRepository,
        IQuestionService questionService)
    {
        _userRepository = userRepository;
        _examRepository = examRepository;
        _questionRepository = questionRepository;
        _subscriptionRepository = subscriptionRepository;
        _questionService = questionService;
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult> GetDashboard(CancellationToken cancellationToken)
    {
        var totalUsers = await _userRepository.CountAsync(cancellationToken: cancellationToken);
        var totalQuestions = await _questionRepository.CountAsync(q => q.IsActive, cancellationToken);
        var totalExams = await _examRepository.CountAsync(cancellationToken: cancellationToken);
        var activeSubscriptions = await _subscriptionRepository.CountAsync(
            s => s.Status == Domain.Enums.SubscriptionStatus.Active, cancellationToken);

        var recentExams = await _examRepository.Query()
            .OrderByDescending(e => e.StartedAt)
            .Take(10)
            .Select(e => new
            {
                e.Id,
                e.UserId,
                e.ExamType,
                e.Status,
                e.Score,
                e.TotalQuestions,
                e.CorrectAnswers,
                e.StartedAt,
                e.FinishedAt
            })
            .ToListAsync(cancellationToken);

        return Ok(new
        {
            totalUsers,
            totalQuestions,
            totalExams,
            activeSubscriptions,
            recentExams
        });
    }

    [HttpGet("users")]
    public async Task<ActionResult> GetUsers(
        [FromQuery] PagedRequest request,
        CancellationToken cancellationToken)
    {
        var query = _userRepository.Query().OrderByDescending(u => u.CreatedAt);
        var total = await query.CountAsync(cancellationToken);

        var users = await query
            .Skip(request.Skip)
            .Take(request.PageSize)
            .Select(u => new
            {
                u.Id,
                u.Email,
                u.PhoneNumber,
                u.FullName,
                u.Role,
                u.IsEmailVerified,
                u.IsPhoneVerified,
                u.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Ok(new
        {
            items = users,
            total,
            page = request.Page,
            pageSize = request.PageSize,
            totalPages = (int)Math.Ceiling((double)total / request.PageSize)
        });
    }

    [HttpGet("analytics")]
    public async Task<ActionResult> GetAnalytics(CancellationToken cancellationToken)
    {
        var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);

        var newUsersLast30Days = await _userRepository.CountAsync(
            u => u.CreatedAt >= thirtyDaysAgo, cancellationToken);

        var examsLast30Days = await _examRepository.CountAsync(
            e => e.StartedAt >= thirtyDaysAgo, cancellationToken);

        var completedExams = await _examRepository.Query()
            .Where(e => e.Status == Domain.Enums.ExamStatus.Completed && e.StartedAt >= thirtyDaysAgo)
            .ToListAsync(cancellationToken);

        var averageScore = completedExams.Count > 0
            ? Math.Round(completedExams.Where(e => e.Score.HasValue).Average(e => e.Score!.Value), 2)
            : 0;

        var examsByType = completedExams
            .GroupBy(e => e.ExamType)
            .Select(g => new { ExamType = g.Key.ToString(), Count = g.Count() })
            .ToList();

        var dailyExams = completedExams
            .GroupBy(e => e.StartedAt.Date)
            .OrderBy(g => g.Key)
            .Select(g => new { Date = g.Key.ToString("yyyy-MM-dd"), Count = g.Count() })
            .ToList();

        return Ok(new
        {
            newUsersLast30Days,
            examsLast30Days,
            averageScore,
            examsByType,
            dailyExams
        });
    }

    [HttpPost("import")]
    public async Task<ActionResult> Import(
        [FromBody] List<CreateQuestionRequest> questions,
        CancellationToken cancellationToken)
    {
        var count = await _questionService.BulkImportAsync(questions, cancellationToken);
        return Ok(new { imported = count });
    }
}
