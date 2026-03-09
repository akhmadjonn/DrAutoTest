using DrAutoTest.Application.DTOs.Questions;
using FluentValidation;

namespace DrAutoTest.Application.Validators;

public class CreateQuestionRequestValidator : AbstractValidator<CreateQuestionRequest>
{
    public CreateQuestionRequestValidator()
    {
        RuleFor(x => x.CategoryId)
            .NotEmpty().WithMessage("Category ID is required.");

        RuleFor(x => x.Text)
            .NotEmpty().WithMessage("Question text is required.")
            .MaximumLength(2000).WithMessage("Question text must not exceed 2000 characters.");

        RuleFor(x => x.Difficulty)
            .IsInEnum().WithMessage("Invalid difficulty level.");

        RuleFor(x => x.Answers)
            .NotEmpty().WithMessage("At least one answer is required.")
            .Must(a => a.Count >= 2).WithMessage("At least two answers are required.")
            .Must(a => a.Count <= 6).WithMessage("No more than 6 answers allowed.")
            .Must(a => a.Count(ans => ans.IsCorrect) >= 1).WithMessage("At least one correct answer is required.");

        RuleForEach(x => x.Answers).ChildRules(answer =>
        {
            answer.RuleFor(a => a.Text)
                .NotEmpty().WithMessage("Answer text is required.")
                .MaximumLength(500).WithMessage("Answer text must not exceed 500 characters.");
        });
    }
}
