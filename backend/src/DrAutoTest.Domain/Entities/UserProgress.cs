namespace DrAutoTest.Domain.Entities;

public class UserProgress : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid QuestionId { get; set; }
    public int TimesSeen { get; set; }
    public int TimesCorrect { get; set; }
    public DateTime LastSeenAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public Question Question { get; set; } = null!;
}
