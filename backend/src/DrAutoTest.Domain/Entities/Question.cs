using DrAutoTest.Domain.Enums;

namespace DrAutoTest.Domain.Entities;

public class Question : BaseEntity
{
    public Guid CategoryId { get; set; }
    public string Text { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public string? Explanation { get; set; }
    public Difficulty Difficulty { get; set; } = Difficulty.Medium;
    public bool IsActive { get; set; } = true;

    public Category Category { get; set; } = null!;
    public ICollection<Answer> Answers { get; set; } = new List<Answer>();
}
