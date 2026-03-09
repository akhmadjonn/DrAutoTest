using DrAutoTest.Domain.Enums;

namespace DrAutoTest.Domain.Entities;

public class Exam : BaseEntity
{
    public Guid UserId { get; set; }
    public ExamType ExamType { get; set; }
    public ExamStatus Status { get; set; } = ExamStatus.InProgress;
    public double? Score { get; set; }
    public int TotalQuestions { get; set; }
    public int CorrectAnswers { get; set; }
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? FinishedAt { get; set; }
    public int? TimeLimitSeconds { get; set; }

    public User User { get; set; } = null!;
    public ICollection<ExamQuestion> ExamQuestions { get; set; } = new List<ExamQuestion>();
}
