using DrAutoTest.Domain.Enums;

namespace DrAutoTest.Application.DTOs.Questions;

public class UpdateQuestionRequest
{
    public Guid CategoryId { get; set; }
    public string Text { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public string? Explanation { get; set; }
    public Difficulty Difficulty { get; set; }
    public bool IsActive { get; set; }
    public List<UpdateAnswerRequest> Answers { get; set; } = new();
}

public class UpdateAnswerRequest
{
    public Guid? Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public bool IsCorrect { get; set; }
    public int DisplayOrder { get; set; }
}
