using DrAutoTest.Application.DTOs.Common;
using DrAutoTest.Application.DTOs.Questions;

namespace DrAutoTest.Application.Interfaces;

public interface IQuestionService
{
    Task<PagedResponse<QuestionDto>> GetByCategoryAsync(Guid categoryId, PagedRequest request, CancellationToken cancellationToken = default);
    Task<QuestionDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<QuestionDto> CreateAsync(CreateQuestionRequest request, CancellationToken cancellationToken = default);
    Task<QuestionDto> UpdateAsync(Guid id, UpdateQuestionRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<int> BulkImportAsync(List<CreateQuestionRequest> questions, CancellationToken cancellationToken = default);
}
