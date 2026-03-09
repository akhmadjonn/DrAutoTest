using DrAutoTest.Domain.Enums;

namespace DrAutoTest.Application.DTOs.Questions;

public class QuestionDto
{
    public Guid Id { get; set; }
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string Text { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public string? Explanation { get; set; }
    public Difficulty Difficulty { get; set; }
    public bool IsActive { get; set; }
    public List<AnswerDto> Answers { get; set; } = new();
}
