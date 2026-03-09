namespace DrAutoTest.Application.Interfaces;

public interface IFileStorageService
{
    Task<string> UploadAsync(Stream stream, string fileName, string contentType, CancellationToken cancellationToken = default);
    Task DeleteAsync(string fileUrl, CancellationToken cancellationToken = default);
    Task<string> GetPresignedUrlAsync(string fileUrl, CancellationToken cancellationToken = default);
}
