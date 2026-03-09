using AutoMapper;
using DrAutoTest.Application.DTOs.Common;
using DrAutoTest.Application.DTOs.Questions;
using DrAutoTest.Application.Interfaces;
using DrAutoTest.Domain.Entities;
using DrAutoTest.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DrAutoTest.Infrastructure.Services;

public class QuestionService : IQuestionService
{
    private readonly IRepository<Question> _questionRepository;
    private readonly IRepository<Answer> _answerRepository;
    private readonly IRepository<Category> _categoryRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<QuestionService> _logger;

    public QuestionService(
        IRepository<Question> questionRepository,
        IRepository<Answer> answerRepository,
        IRepository<Category> categoryRepository,
        IUnitOfWork unitOfWork,
        IMapper mapper,
        ILogger<QuestionService> logger)
    {
        _questionRepository = questionRepository;
        _answerRepository = answerRepository;
        _categoryRepository = categoryRepository;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<PagedResponse<QuestionDto>> GetByCategoryAsync(Guid categoryId, PagedRequest request, CancellationToken cancellationToken = default)
    {
        var query = _questionRepository.Query()
            .Where(q => q.CategoryId == categoryId && q.IsActive)
            .Include(q => q.Category)
            .Include(q => q.Answers.OrderBy(a => a.DisplayOrder))
            .OrderBy(q => q.CreatedAt);

        var total = await query.CountAsync(cancellationToken);

        var questions = await query
            .Skip(request.Skip)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var dtos = _mapper.Map<List<QuestionDto>>(questions);
        return PagedResponse<QuestionDto>.Create(dtos, total, request.Page, request.PageSize);
    }

    public async Task<QuestionDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var question = await _questionRepository.Query()
            .Include(q => q.Category)
            .Include(q => q.Answers.OrderBy(a => a.DisplayOrder))
            .FirstOrDefaultAsync(q => q.Id == id, cancellationToken);

        if (question == null)
        {
            throw new KeyNotFoundException("Question not found.");
        }

        return _mapper.Map<QuestionDto>(question);
    }

    public async Task<QuestionDto> CreateAsync(CreateQuestionRequest request, CancellationToken cancellationToken = default)
    {
        var categoryExists = await _categoryRepository.AnyAsync(c => c.Id == request.CategoryId, cancellationToken);
        if (!categoryExists)
        {
            throw new KeyNotFoundException("Category not found.");
        }

        var question = _mapper.Map<Question>(request);
        question.Answers = request.Answers.Select(a => _mapper.Map<Answer>(a)).ToList();

        await _questionRepository.AddAsync(question, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Question {QuestionId} created in category {CategoryId}", question.Id, request.CategoryId);

        return await GetByIdAsync(question.Id, cancellationToken);
    }

    public async Task<QuestionDto> UpdateAsync(Guid id, UpdateQuestionRequest request, CancellationToken cancellationToken = default)
    {
        var question = await _questionRepository.Query()
            .Include(q => q.Answers)
            .FirstOrDefaultAsync(q => q.Id == id, cancellationToken);

        if (question == null)
        {
            throw new KeyNotFoundException("Question not found.");
        }

        question.CategoryId = request.CategoryId;
        question.Text = request.Text;
        question.ImageUrl = request.ImageUrl;
        question.Explanation = request.Explanation;
        question.Difficulty = request.Difficulty;
        question.IsActive = request.IsActive;

        var existingAnswerIds = question.Answers.Select(a => a.Id).ToList();
        var updatedAnswerIds = request.Answers.Where(a => a.Id.HasValue).Select(a => a.Id!.Value).ToList();
        var answersToRemove = question.Answers.Where(a => !updatedAnswerIds.Contains(a.Id)).ToList();

        foreach (var answer in answersToRemove)
        {
            await _answerRepository.DeleteAsync(answer, cancellationToken);
        }

        foreach (var answerRequest in request.Answers)
        {
            if (answerRequest.Id.HasValue)
            {
                var existingAnswer = question.Answers.FirstOrDefault(a => a.Id == answerRequest.Id.Value);
                if (existingAnswer != null)
                {
                    existingAnswer.Text = answerRequest.Text;
                    existingAnswer.ImageUrl = answerRequest.ImageUrl;
                    existingAnswer.IsCorrect = answerRequest.IsCorrect;
                    existingAnswer.DisplayOrder = answerRequest.DisplayOrder;
                }
            }
            else
            {
                var newAnswer = new Answer
                {
                    QuestionId = question.Id,
                    Text = answerRequest.Text,
                    ImageUrl = answerRequest.ImageUrl,
                    IsCorrect = answerRequest.IsCorrect,
                    DisplayOrder = answerRequest.DisplayOrder
                };
                await _answerRepository.AddAsync(newAnswer, cancellationToken);
            }
        }

        await _questionRepository.UpdateAsync(question, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var question = await _questionRepository.GetByIdAsync(id, cancellationToken);
        if (question == null)
        {
            throw new KeyNotFoundException("Question not found.");
        }

        await _questionRepository.DeleteAsync(question, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Question {QuestionId} deleted", id);
    }

    public async Task<int> BulkImportAsync(List<CreateQuestionRequest> questions, CancellationToken cancellationToken = default)
    {
        var importedCount = 0;

        await _unitOfWork.BeginTransactionAsync(cancellationToken);
        try
        {
            foreach (var request in questions)
            {
                var categoryExists = await _categoryRepository.AnyAsync(
                    c => c.Id == request.CategoryId, cancellationToken);

                if (!categoryExists)
                {
                    _logger.LogWarning("Skipping question import: Category {CategoryId} not found", request.CategoryId);
                    continue;
                }

                var question = _mapper.Map<Question>(request);
                question.Answers = request.Answers.Select(a => _mapper.Map<Answer>(a)).ToList();

                await _questionRepository.AddAsync(question, cancellationToken);
                importedCount++;
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _unitOfWork.CommitTransactionAsync(cancellationToken);

            _logger.LogInformation("Bulk import completed: {Count} questions imported", importedCount);
        }
        catch
        {
            await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            throw;
        }

        return importedCount;
    }
}
