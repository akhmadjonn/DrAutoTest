using DrAutoTest.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Minio;
using Minio.DataModel.Args;

namespace DrAutoTest.Infrastructure.Services;

public class FileStorageService : IFileStorageService
{
    private readonly IMinioClient _minioClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<FileStorageService> _logger;
    private readonly string _bucketName;

    public FileStorageService(
        IMinioClient minioClient,
        IConfiguration configuration,
        ILogger<FileStorageService> logger)
    {
        _minioClient = minioClient;
        _configuration = configuration;
        _logger = logger;
        _bucketName = _configuration["MinioSettings:BucketName"] ?? "drautotest";
    }

    public async Task<string> UploadAsync(Stream stream, string fileName, string contentType, CancellationToken cancellationToken = default)
    {
        await EnsureBucketExistsAsync(cancellationToken);

        var objectName = $"{DateTime.UtcNow:yyyy/MM/dd}/{Guid.NewGuid()}/{fileName}";

        var putArgs = new PutObjectArgs()
            .WithBucket(_bucketName)
            .WithObject(objectName)
            .WithStreamData(stream)
            .WithObjectSize(stream.Length)
            .WithContentType(contentType);

        await _minioClient.PutObjectAsync(putArgs, cancellationToken);

        var endpoint = _configuration["MinioSettings:Endpoint"] ?? "localhost:9000";
        var useSSL = bool.Parse(_configuration["MinioSettings:UseSSL"] ?? "false");
        var protocol = useSSL ? "https" : "http";
        var fileUrl = $"{protocol}://{endpoint}/{_bucketName}/{objectName}";

        _logger.LogInformation("File uploaded: {FileUrl}", fileUrl);

        return fileUrl;
    }

    public async Task DeleteAsync(string fileUrl, CancellationToken cancellationToken = default)
    {
        var objectName = ExtractObjectName(fileUrl);
        if (string.IsNullOrEmpty(objectName))
        {
            _logger.LogWarning("Could not extract object name from URL: {FileUrl}", fileUrl);
            return;
        }

        var removeArgs = new RemoveObjectArgs()
            .WithBucket(_bucketName)
            .WithObject(objectName);

        await _minioClient.RemoveObjectAsync(removeArgs, cancellationToken);

        _logger.LogInformation("File deleted: {ObjectName}", objectName);
    }

    public async Task<string> GetPresignedUrlAsync(string fileUrl, CancellationToken cancellationToken = default)
    {
        var objectName = ExtractObjectName(fileUrl);
        if (string.IsNullOrEmpty(objectName))
        {
            throw new ArgumentException("Invalid file URL.");
        }

        var presignedArgs = new PresignedGetObjectArgs()
            .WithBucket(_bucketName)
            .WithObject(objectName)
            .WithExpiry(3600);

        var presignedUrl = await _minioClient.PresignedGetObjectAsync(presignedArgs);

        return presignedUrl;
    }

    private async Task EnsureBucketExistsAsync(CancellationToken cancellationToken)
    {
        var bucketExistsArgs = new BucketExistsArgs().WithBucket(_bucketName);
        var exists = await _minioClient.BucketExistsAsync(bucketExistsArgs, cancellationToken);

        if (!exists)
        {
            var makeBucketArgs = new MakeBucketArgs().WithBucket(_bucketName);
            await _minioClient.MakeBucketAsync(makeBucketArgs, cancellationToken);
            _logger.LogInformation("Created MinIO bucket: {BucketName}", _bucketName);
        }
    }

    private string? ExtractObjectName(string fileUrl)
    {
        var bucketPrefix = $"/{_bucketName}/";
        var index = fileUrl.IndexOf(bucketPrefix, StringComparison.OrdinalIgnoreCase);
        if (index < 0) return null;
        return fileUrl[(index + bucketPrefix.Length)..];
    }
}
