using DrAutoTest.Application.DTOs.Progress;

namespace DrAutoTest.Application.Interfaces;

public interface IProgressService
{
    Task<ProgressSummaryDto> GetSummaryAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<List<CategoryProgressDto>> GetCategoryProgressAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<List<WeakAreaDto>> GetWeakAreasAsync(Guid userId, CancellationToken cancellationToken = default);
}
