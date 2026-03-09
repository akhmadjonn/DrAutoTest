namespace DrAutoTest.Domain.Entities;

public class Answer : BaseEntity
{
    public Guid QuestionId { get; set; }
    public string Text { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public bool IsCorrect { get; set; }
    public int DisplayOrder { get; set; }

    public Question Question { get; set; } = null!;
}
