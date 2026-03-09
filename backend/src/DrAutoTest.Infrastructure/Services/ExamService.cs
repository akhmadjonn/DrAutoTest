using AutoMapper;
using DrAutoTest.Application.DTOs.Common;
using DrAutoTest.Application.DTOs.Exams;
using DrAutoTest.Application.DTOs.Questions;
using DrAutoTest.Application.Interfaces;
using DrAutoTest.Domain.Entities;
using DrAutoTest.Domain.Enums;
using DrAutoTest.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DrAutoTest.Infrastructure.Services;

public class ExamService : IExamService
{
    private readonly IRepository<Exam> _examRepository;
    private readonly IRepository<ExamQuestion> _examQuestionRepository;
    private readonly IRepository<Question> _questionRepository;
    private readonly IRepository<Answer> _answerRepository;
    private readonly IRepository<UserProgress> _progressRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<ExamService> _logger;

    public ExamService(
        IRepository<Exam> examRepository,
        IRepository<ExamQuestion> examQuestionRepository,
        IRepository<Question> questionRepository,
        IRepository<Answer> answerRepository,
        IRepository<UserProgress> progressRepository,
        IUnitOfWork unitOfWork,
        IMapper mapper,
        ILogger<ExamService> logger)
    {
        _examRepository = examRepository;
        _examQuestionRepository = examQuestionRepository;
        _questionRepository = questionRepository;
        _answerRepository = answerRepository;
        _progressRepository = progressRepository;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<ExamDto> StartExamAsync(Guid userId, StartExamRequest request, CancellationToken cancellationToken = default)
    {
        var questionCount = request.QuestionCount ?? 20;
        var questions = await SelectQuestionsAsync(userId, request.ExamType, request.CategoryId, questionCount, cancellationToken);

        if (questions.Count == 0)
        {
            throw new InvalidOperationException("No questions available for this exam configuration.");
        }

        var exam = new Exam
        {
            UserId = userId,
            ExamType = request.ExamType,
            Status = ExamStatus.InProgress,
            TotalQuestions = questions.Count,
            StartedAt = DateTime.UtcNow,
            TimeLimitSeconds = request.TimeLimitSeconds ?? (request.ExamType == ExamType.MockExam ? 1800 : null)
        };

        await _examRepository.AddAsync(exam, cancellationToken);

        foreach (var question in questions)
        {
            var examQuestion = new ExamQuestion
            {
                ExamId = exam.Id,
                QuestionId = question.Id
            };
            await _examQuestionRepository.AddAsync(examQuestion, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Exam {ExamId} started for user {UserId} with {Count} questions",
            exam.Id, userId, questions.Count);

        return await GetExamAsync(userId, exam.Id, cancellationToken);
    }

    public async Task<ExamDto> GetExamAsync(Guid userId, Guid examId, CancellationToken cancellationToken = default)
    {
        var exam = await _examRepository.Query()
            .Include(e => e.ExamQuestions)
                .ThenInclude(eq => eq.Question)
                    .ThenInclude(q => q.Answers)
            .FirstOrDefaultAsync(e => e.Id == examId && e.UserId == userId, cancellationToken);

        if (exam == null)
        {
            throw new KeyNotFoundException("Exam not found.");
        }

        if (exam.Status == ExamStatus.InProgress && exam.TimeLimitSeconds.HasValue)
        {
            var elapsed = (DateTime.UtcNow - exam.StartedAt).TotalSeconds;
            if (elapsed > exam.TimeLimitSeconds.Value)
            {
                exam.Status = ExamStatus.Expired;
                exam.FinishedAt = exam.StartedAt.AddSeconds(exam.TimeLimitSeconds.Value);
                await _examRepository.UpdateAsync(exam, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
            }
        }

        var dto = _mapper.Map<ExamDto>(exam);

        if (exam.Status == ExamStatus.InProgress)
        {
            foreach (var q in dto.Questions)
            {
                foreach (var a in q.Answers)
                {
                    a.IsCorrect = false;
                }
                q.Explanation = null;
            }
        }

        return dto;
    }

    public async Task<ExamQuestionDto> SubmitAnswerAsync(Guid userId, SubmitAnswerRequest request, CancellationToken cancellationToken = default)
    {
        var examQuestion = await _examQuestionRepository.Query()
            .Include(eq => eq.Exam)
            .Include(eq => eq.Question)
                .ThenInclude(q => q.Answers)
            .FirstOrDefaultAsync(eq => eq.Id == request.ExamQuestionId && eq.Exam.UserId == userId, cancellationToken);

        if (examQuestion == null)
        {
            throw new KeyNotFoundException("Exam question not found.");
        }

        if (examQuestion.Exam.Status != ExamStatus.InProgress)
        {
            throw new InvalidOperationException("This exam is no longer in progress.");
        }

        if (examQuestion.SelectedAnswerId.HasValue)
        {
            throw new InvalidOperationException("This question has already been answered.");
        }

        var answer = await _answerRepository.GetByIdAsync(request.AnswerId, cancellationToken);
        if (answer == null || answer.QuestionId != examQuestion.QuestionId)
        {
            throw new InvalidOperationException("Invalid answer for this question.");
        }

        examQuestion.SelectedAnswerId = request.AnswerId;
        examQuestion.IsCorrect = answer.IsCorrect;
        examQuestion.AnsweredAt = DateTime.UtcNow;

        await _examQuestionRepository.UpdateAsync(examQuestion, cancellationToken);

        await UpdateUserProgressAsync(userId, examQuestion.QuestionId, answer.IsCorrect, cancellationToken);

        if (answer.IsCorrect)
        {
            examQuestion.Exam.CorrectAnswers++;
            await _examRepository.UpdateAsync(examQuestion.Exam, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<ExamQuestionDto>(examQuestion);
    }

    public async Task<ExamResultDto> FinishExamAsync(Guid userId, Guid examId, CancellationToken cancellationToken = default)
    {
        var exam = await _examRepository.Query()
            .Include(e => e.ExamQuestions)
                .ThenInclude(eq => eq.Question)
                    .ThenInclude(q => q.Answers)
            .FirstOrDefaultAsync(e => e.Id == examId && e.UserId == userId, cancellationToken);

        if (exam == null)
        {
            throw new KeyNotFoundException("Exam not found.");
        }

        if (exam.Status != ExamStatus.InProgress)
        {
            throw new InvalidOperationException("This exam is already finished.");
        }

        exam.Status = ExamStatus.Completed;
        exam.FinishedAt = DateTime.UtcNow;
        exam.Score = exam.TotalQuestions > 0
            ? Math.Round((double)exam.CorrectAnswers / exam.TotalQuestions * 100, 2)
            : 0;

        await _examRepository.UpdateAsync(exam, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Exam {ExamId} finished for user {UserId}. Score: {Score}%",
            examId, userId, exam.Score);

        var answeredCount = exam.ExamQuestions.Count(eq => eq.SelectedAnswerId.HasValue);
        var incorrectCount = exam.ExamQuestions.Count(eq => eq.IsCorrect == false);

        return new ExamResultDto
        {
            ExamId = exam.Id,
            ExamType = exam.ExamType,
            Score = exam.Score.Value,
            TotalQuestions = exam.TotalQuestions,
            CorrectAnswers = exam.CorrectAnswers,
            IncorrectAnswers = incorrectCount,
            UnansweredQuestions = exam.TotalQuestions - answeredCount,
            Duration = exam.FinishedAt.Value - exam.StartedAt,
            Questions = _mapper.Map<List<ExamQuestionDto>>(exam.ExamQuestions)
        };
    }

    public async Task<PagedResponse<ExamDto>> GetExamHistoryAsync(Guid userId, PagedRequest request, CancellationToken cancellationToken = default)
    {
        var query = _examRepository.Query()
            .Where(e => e.UserId == userId)
            .OrderByDescending(e => e.StartedAt);

        var total = await query.CountAsync(cancellationToken);

        var exams = await query
            .Skip(request.Skip)
            .Take(request.PageSize)
            .Include(e => e.ExamQuestions)
            .ToListAsync(cancellationToken);

        var dtos = _mapper.Map<List<ExamDto>>(exams);

        return PagedResponse<ExamDto>.Create(dtos, total, request.Page, request.PageSize);
    }

    private async Task<List<Question>> SelectQuestionsAsync(
        Guid userId, ExamType examType, Guid? categoryId, int count, CancellationToken cancellationToken)
    {
        IQueryable<Question> query = _questionRepository.Query()
            .Where(q => q.IsActive)
            .Include(q => q.Answers);

        switch (examType)
        {
            case ExamType.ByCategory:
                if (!categoryId.HasValue)
                    throw new InvalidOperationException("Category ID is required for category-based exams.");
                query = query.Where(q => q.CategoryId == categoryId.Value);
                break;

            case ExamType.WeakAreas:
                var weakQuestionIds = await _progressRepository.Query()
                    .Where(up => up.UserId == userId && up.TimesSeen > 0)
                    .Where(up => (double)up.TimesCorrect / up.TimesSeen < 0.5)
                    .Select(up => up.QuestionId)
                    .ToListAsync(cancellationToken);

                if (weakQuestionIds.Count > 0)
                {
                    query = query.Where(q => weakQuestionIds.Contains(q.Id));
                }
                break;

            case ExamType.MockExam:
                count = 30;
                break;

            case ExamType.Random:
            case ExamType.Custom:
                break;
        }

        var questions = await query
            .OrderBy(q => Guid.NewGuid())
            .Take(count)
            .ToListAsync(cancellationToken);

        return questions;
    }

    private async Task UpdateUserProgressAsync(Guid userId, Guid questionId, bool isCorrect, CancellationToken cancellationToken)
    {
        var progress = await _progressRepository.FirstOrDefaultAsync(
            p => p.UserId == userId && p.QuestionId == questionId, cancellationToken);

        if (progress == null)
        {
            progress = new UserProgress
            {
                UserId = userId,
                QuestionId = questionId,
                TimesSeen = 1,
                TimesCorrect = isCorrect ? 1 : 0,
                LastSeenAt = DateTime.UtcNow
            };
            await _progressRepository.AddAsync(progress, cancellationToken);
        }
        else
        {
            progress.TimesSeen++;
            if (isCorrect) progress.TimesCorrect++;
            progress.LastSeenAt = DateTime.UtcNow;
            await _progressRepository.UpdateAsync(progress, cancellationToken);
        }
    }
}
