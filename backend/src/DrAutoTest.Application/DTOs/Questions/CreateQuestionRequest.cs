using DrAutoTest.Domain.Enums;

namespace DrAutoTest.Application.DTOs.Questions;

public class CreateQuestionRequest
{
    public Guid CategoryId { get; set; }
    public string Text { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public string? Explanation { get; set; }
    public Difficulty Difficulty { get; set; } = Difficulty.Medium;
    public List<CreateAnswerRequest> Answers { get; set; } = new();
}

public class CreateAnswerRequest
{
    public string Text { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public bool IsCorrect { get; set; }
    public int DisplayOrder { get; set; }
}
