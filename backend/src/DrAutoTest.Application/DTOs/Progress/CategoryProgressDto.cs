namespace DrAutoTest.Application.DTOs.Progress;

public class CategoryProgressDto
{
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public int TotalQuestions { get; set; }
    public int Answered { get; set; }
    public int Correct { get; set; }
    public double Accuracy { get; set; }
}
