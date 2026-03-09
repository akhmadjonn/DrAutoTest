using DrAutoTest.Domain.Enums;

namespace DrAutoTest.Application.DTOs.Exams;

public class StartExamRequest
{
    public ExamType ExamType { get; set; }
    public Guid? CategoryId { get; set; }
    public int? QuestionCount { get; set; }
    public int? TimeLimitSeconds { get; set; }
}
