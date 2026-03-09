namespace DrAutoTest.Application.DTOs.Progress;

public class WeakAreaDto
{
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public int TotalAttempts { get; set; }
    public int CorrectAttempts { get; set; }
    public double Accuracy { get; set; }
    public int RecommendedPracticeCount { get; set; }
}
