using DrAutoTest.Application.Interfaces;
using DrAutoTest.Domain.Interfaces;
using DrAutoTest.Infrastructure.Persistence;
using DrAutoTest.Infrastructure.Services;
using Hangfire;
using Hangfire.PostgreSql;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Minio;
using StackExchange.Redis;

namespace DrAutoTest.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // Database
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName)));

        // Repositories
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Redis
        var redisConnectionString = configuration.GetConnectionString("Redis") ?? "localhost:6379";
        services.AddSingleton<IConnectionMultiplexer>(
            ConnectionMultiplexer.Connect(redisConnectionString));

        // MinIO
        services.AddSingleton<IMinioClient>(sp =>
        {
            var endpoint = configuration["MinioSettings:Endpoint"] ?? "localhost:9000";
            var accessKey = configuration["MinioSettings:AccessKey"] ?? "minioadmin";
            var secretKey = configuration["MinioSettings:SecretKey"] ?? "minioadmin";
            var useSSL = bool.Parse(configuration["MinioSettings:UseSSL"] ?? "false");

            return new MinioClient()
                .WithEndpoint(endpoint)
                .WithCredentials(accessKey, secretKey)
                .WithSSL(useSSL)
                .Build();
        });

        // Hangfire
        services.AddHangfire(config => config
            .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
            .UseSimpleAssemblyNameTypeSerializer()
            .UseRecommendedSerializerSettings()
            .UsePostgreSqlStorage(opts =>
                opts.UseNpgsqlConnection(
                    configuration.GetConnectionString("HangfireConnection")
                    ?? configuration.GetConnectionString("DefaultConnection")!)));

        services.AddHangfireServer();

        // Application Services
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IExamService, ExamService>();
        services.AddScoped<IQuestionService, QuestionService>();
        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<IProgressService, ProgressService>();
        services.AddScoped<ISubscriptionService, SubscriptionService>();
        services.AddScoped<IPaymentService, PaymentService>();
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<ISmsService, SmsService>();
        services.AddScoped<IEmailService, EmailService>();
        services.AddScoped<IFileStorageService, FileStorageService>();
        services.AddScoped<ICacheService, CacheService>();

        return services;
    }
}
