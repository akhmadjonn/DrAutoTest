using DrAutoTest.Domain.Enums;

namespace DrAutoTest.Application.DTOs.Exams;

public class ExamDto
{
    public Guid Id { get; set; }
    public ExamType ExamType { get; set; }
    public ExamStatus Status { get; set; }
    public double? Score { get; set; }
    public int TotalQuestions { get; set; }
    public int CorrectAnswers { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? FinishedAt { get; set; }
    public int? TimeLimitSeconds { get; set; }
    public List<ExamQuestionDto> Questions { get; set; } = new();
}
