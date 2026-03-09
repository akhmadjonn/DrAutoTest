namespace DrAutoTest.Application.DTOs.Questions;

public class AnswerDto
{
    public Guid Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public bool IsCorrect { get; set; }
    public int DisplayOrder { get; set; }
}
