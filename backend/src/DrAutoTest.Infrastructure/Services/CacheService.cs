using System.Text.Json;
using DrAutoTest.Application.Interfaces;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;

namespace DrAutoTest.Infrastructure.Services;

public class CacheService : ICacheService
{
    private readonly IConnectionMultiplexer _redis;
    private readonly ILogger<CacheService> _logger;

    public CacheService(IConnectionMultiplexer redis, ILogger<CacheService> logger)
    {
        _redis = redis;
        _logger = logger;
    }

    public async Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default)
    {
        var db = _redis.GetDatabase();
        var value = await db.StringGetAsync(key);

        if (value.IsNullOrEmpty)
        {
            return default;
        }

        if (typeof(T) == typeof(string))
        {
            return (T)(object)value.ToString();
        }

        return JsonSerializer.Deserialize<T>(value.ToString());
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? expiration = null, CancellationToken cancellationToken = default)
    {
        var db = _redis.GetDatabase();

        string serialized;
        if (typeof(T) == typeof(string))
        {
            serialized = value?.ToString() ?? string.Empty;
        }
        else
        {
            serialized = JsonSerializer.Serialize(value);
        }

        await db.StringSetAsync(key, serialized, expiration);
        _logger.LogDebug("Cache set: {Key}", key);
    }

    public async Task RemoveAsync(string key, CancellationToken cancellationToken = default)
    {
        var db = _redis.GetDatabase();
        await db.KeyDeleteAsync(key);
        _logger.LogDebug("Cache removed: {Key}", key);
    }

    public async Task<bool> ExistsAsync(string key, CancellationToken cancellationToken = default)
    {
        var db = _redis.GetDatabase();
        return await db.KeyExistsAsync(key);
    }
}
