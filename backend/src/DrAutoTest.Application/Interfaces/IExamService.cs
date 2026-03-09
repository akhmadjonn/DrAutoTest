using DrAutoTest.Application.DTOs.Common;
using DrAutoTest.Application.DTOs.Exams;

namespace DrAutoTest.Application.Interfaces;

public interface IExamService
{
    Task<ExamDto> StartExamAsync(Guid userId, StartExamRequest request, CancellationToken cancellationToken = default);
    Task<ExamDto> GetExamAsync(Guid userId, Guid examId, CancellationToken cancellationToken = default);
    Task<ExamQuestionDto> SubmitAnswerAsync(Guid userId, SubmitAnswerRequest request, CancellationToken cancellationToken = default);
    Task<ExamResultDto> FinishExamAsync(Guid userId, Guid examId, CancellationToken cancellationToken = default);
    Task<PagedResponse<ExamDto>> GetExamHistoryAsync(Guid userId, PagedRequest request, CancellationToken cancellationToken = default);
}
