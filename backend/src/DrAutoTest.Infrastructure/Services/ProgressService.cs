using DrAutoTest.Application.DTOs.Progress;
using DrAutoTest.Application.Interfaces;
using DrAutoTest.Domain.Entities;
using DrAutoTest.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DrAutoTest.Infrastructure.Services;

public class ProgressService : IProgressService
{
    private readonly IRepository<UserProgress> _progressRepository;
    private readonly IRepository<Question> _questionRepository;
    private readonly IRepository<Category> _categoryRepository;

    public ProgressService(
        IRepository<UserProgress> progressRepository,
        IRepository<Question> questionRepository,
        IRepository<Category> categoryRepository)
    {
        _progressRepository = progressRepository;
        _questionRepository = questionRepository;
        _categoryRepository = categoryRepository;
    }

    public async Task<ProgressSummaryDto> GetSummaryAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var totalQuestions = await _questionRepository.CountAsync(q => q.IsActive, cancellationToken);

        var userProgress = await _progressRepository.Query()
            .Where(up => up.UserId == userId)
            .Include(up => up.Question)
                .ThenInclude(q => q.Category)
            .ToListAsync(cancellationToken);

        var answered = userProgress.Count;
        var correct = userProgress.Sum(up => up.TimesCorrect > 0 ? 1 : 0);

        var categoryBreakdown = userProgress
            .GroupBy(up => new { up.Question.CategoryId, up.Question.Category.Name })
            .Select(g => new CategoryProgressDto
            {
                CategoryId = g.Key.CategoryId,
                CategoryName = g.Key.Name,
                TotalQuestions = g.Count(),
                Answered = g.Count(),
                Correct = g.Count(up => up.TimesCorrect > 0),
                Accuracy = g.Count() > 0
                    ? Math.Round((double)g.Count(up => up.TimesCorrect > 0) / g.Count() * 100, 2)
                    : 0
            })
            .OrderBy(c => c.CategoryName)
            .ToList();

        return new ProgressSummaryDto
        {
            TotalQuestions = totalQuestions,
            Answered = answered,
            Correct = correct,
            OverallAccuracy = answered > 0 ? Math.Round((double)correct / answered * 100, 2) : 0,
            CategoryBreakdown = categoryBreakdown
        };
    }

    public async Task<List<CategoryProgressDto>> GetCategoryProgressAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var categories = await _categoryRepository.Query()
            .Where(c => c.IsActive)
            .Include(c => c.Questions)
            .ToListAsync(cancellationToken);

        var userProgress = await _progressRepository.Query()
            .Where(up => up.UserId == userId)
            .ToListAsync(cancellationToken);

        var progressLookup = userProgress.ToDictionary(up => up.QuestionId);

        return categories.Select(c =>
        {
            var categoryQuestionIds = c.Questions.Where(q => q.IsActive).Select(q => q.Id).ToList();
            var answeredInCategory = categoryQuestionIds.Count(qId => progressLookup.ContainsKey(qId));
            var correctInCategory = categoryQuestionIds.Count(qId =>
                progressLookup.TryGetValue(qId, out var p) && p.TimesCorrect > 0);

            return new CategoryProgressDto
            {
                CategoryId = c.Id,
                CategoryName = c.Name,
                TotalQuestions = categoryQuestionIds.Count,
                Answered = answeredInCategory,
                Correct = correctInCategory,
                Accuracy = answeredInCategory > 0
                    ? Math.Round((double)correctInCategory / answeredInCategory * 100, 2)
                    : 0
            };
        })
        .OrderBy(c => c.CategoryName)
        .ToList();
    }

    public async Task<List<WeakAreaDto>> GetWeakAreasAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var userProgress = await _progressRepository.Query()
            .Where(up => up.UserId == userId && up.TimesSeen > 0)
            .Include(up => up.Question)
                .ThenInclude(q => q.Category)
            .ToListAsync(cancellationToken);

        var weakAreas = userProgress
            .GroupBy(up => new { up.Question.CategoryId, up.Question.Category.Name })
            .Select(g =>
            {
                var totalAttempts = g.Sum(up => up.TimesSeen);
                var correctAttempts = g.Sum(up => up.TimesCorrect);
                var accuracy = totalAttempts > 0
                    ? Math.Round((double)correctAttempts / totalAttempts * 100, 2)
                    : 0;

                return new WeakAreaDto
                {
                    CategoryId = g.Key.CategoryId,
                    CategoryName = g.Key.Name,
                    TotalAttempts = totalAttempts,
                    CorrectAttempts = correctAttempts,
                    Accuracy = accuracy,
                    RecommendedPracticeCount = accuracy < 50 ? 20 : accuracy < 70 ? 10 : 5
                };
            })
            .Where(w => w.Accuracy < 80)
            .OrderBy(w => w.Accuracy)
            .ToList();

        return weakAreas;
    }
}
