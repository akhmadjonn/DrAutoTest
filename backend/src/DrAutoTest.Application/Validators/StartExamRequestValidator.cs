using DrAutoTest.Application.DTOs.Exams;
using DrAutoTest.Domain.Enums;
using FluentValidation;

namespace DrAutoTest.Application.Validators;

public class StartExamRequestValidator : AbstractValidator<StartExamRequest>
{
    public StartExamRequestValidator()
    {
        RuleFor(x => x.ExamType)
            .IsInEnum().WithMessage("Invalid exam type.");

        RuleFor(x => x.CategoryId)
            .NotEmpty()
            .When(x => x.ExamType == ExamType.ByCategory)
            .WithMessage("Category ID is required for category-based exams.");

        RuleFor(x => x.QuestionCount)
            .InclusiveBetween(5, 100)
            .When(x => x.QuestionCount.HasValue)
            .WithMessage("Question count must be between 5 and 100.");

        RuleFor(x => x.TimeLimitSeconds)
            .InclusiveBetween(60, 7200)
            .When(x => x.TimeLimitSeconds.HasValue)
            .WithMessage("Time limit must be between 60 and 7200 seconds.");
    }
}
