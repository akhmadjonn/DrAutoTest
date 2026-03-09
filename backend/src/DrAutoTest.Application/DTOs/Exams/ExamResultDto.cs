using DrAutoTest.Domain.Enums;

namespace DrAutoTest.Application.DTOs.Exams;

public class ExamResultDto
{
    public Guid ExamId { get; set; }
    public ExamType ExamType { get; set; }
    public double Score { get; set; }
    public int TotalQuestions { get; set; }
    public int CorrectAnswers { get; set; }
    public int IncorrectAnswers { get; set; }
    public int UnansweredQuestions { get; set; }
    public TimeSpan Duration { get; set; }
    public List<ExamQuestionDto> Questions { get; set; } = new();
}
