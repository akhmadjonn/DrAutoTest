namespace DrAutoTest.Application.DTOs.Exams;

public class SubmitAnswerRequest
{
    public Guid ExamQuestionId { get; set; }
    public Guid AnswerId { get; set; }
}
