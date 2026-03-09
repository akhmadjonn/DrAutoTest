using AutoMapper;
using DrAutoTest.Application.DTOs.Categories;
using DrAutoTest.Application.Interfaces;
using DrAutoTest.Domain.Entities;
using DrAutoTest.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DrAutoTest.Infrastructure.Services;

public class CategoryService : ICategoryService
{
    private readonly IRepository<Category> _categoryRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<CategoryService> _logger;

    public CategoryService(
        IRepository<Category> categoryRepository,
        IUnitOfWork unitOfWork,
        IMapper mapper,
        ILogger<CategoryService> logger)
    {
        _categoryRepository = categoryRepository;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<List<CategoryDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var categories = await _categoryRepository.Query()
            .Where(c => c.ParentCategoryId == null && c.IsActive)
            .Include(c => c.Questions)
            .Include(c => c.SubCategories)
                .ThenInclude(sc => sc.Questions)
            .OrderBy(c => c.DisplayOrder)
            .ToListAsync(cancellationToken);

        return _mapper.Map<List<CategoryDto>>(categories);
    }

    public async Task<CategoryDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var category = await _categoryRepository.Query()
            .Include(c => c.Questions)
            .Include(c => c.SubCategories)
                .ThenInclude(sc => sc.Questions)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        if (category == null)
        {
            throw new KeyNotFoundException("Category not found.");
        }

        return _mapper.Map<CategoryDto>(category);
    }

    public async Task<CategoryDto> CreateAsync(CreateCategoryRequest request, CancellationToken cancellationToken = default)
    {
        if (request.ParentCategoryId.HasValue)
        {
            var parentExists = await _categoryRepository.AnyAsync(
                c => c.Id == request.ParentCategoryId.Value, cancellationToken);
            if (!parentExists)
            {
                throw new KeyNotFoundException("Parent category not found.");
            }
        }

        var category = _mapper.Map<Category>(request);
        await _categoryRepository.AddAsync(category, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Category {CategoryId} created: {Name}", category.Id, category.Name);

        return _mapper.Map<CategoryDto>(category);
    }

    public async Task<CategoryDto> UpdateAsync(Guid id, CreateCategoryRequest request, CancellationToken cancellationToken = default)
    {
        var category = await _categoryRepository.GetByIdAsync(id, cancellationToken);
        if (category == null)
        {
            throw new KeyNotFoundException("Category not found.");
        }

        category.Name = request.Name;
        category.Description = request.Description;
        category.IconUrl = request.IconUrl;
        category.DisplayOrder = request.DisplayOrder;
        category.ParentCategoryId = request.ParentCategoryId;

        await _categoryRepository.UpdateAsync(category, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<CategoryDto>(category);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var category = await _categoryRepository.GetByIdAsync(id, cancellationToken);
        if (category == null)
        {
            throw new KeyNotFoundException("Category not found.");
        }

        var hasSubCategories = await _categoryRepository.AnyAsync(
            c => c.ParentCategoryId == id, cancellationToken);
        if (hasSubCategories)
        {
            throw new InvalidOperationException("Cannot delete a category that has subcategories.");
        }

        await _categoryRepository.DeleteAsync(category, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Category {CategoryId} deleted", id);
    }
}
