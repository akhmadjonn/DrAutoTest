namespace DrAutoTest.Application.DTOs.Progress;

public class ProgressSummaryDto
{
    public int TotalQuestions { get; set; }
    public int Answered { get; set; }
    public int Correct { get; set; }
    public double OverallAccuracy { get; set; }
    public List<CategoryProgressDto> CategoryBreakdown { get; set; } = new();
}
