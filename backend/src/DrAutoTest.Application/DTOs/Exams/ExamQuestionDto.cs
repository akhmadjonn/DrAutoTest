using DrAutoTest.Application.DTOs.Questions;

namespace DrAutoTest.Application.DTOs.Exams;

public class ExamQuestionDto
{
    public Guid Id { get; set; }
    public Guid QuestionId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string? QuestionImageUrl { get; set; }
    public string? Explanation { get; set; }
    public Guid? SelectedAnswerId { get; set; }
    public bool? IsCorrect { get; set; }
    public DateTime? AnsweredAt { get; set; }
    public List<AnswerDto> Answers { get; set; } = new();
}
