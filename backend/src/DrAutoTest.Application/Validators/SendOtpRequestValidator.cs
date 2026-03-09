using DrAutoTest.Application.DTOs.Auth;
using DrAutoTest.Domain.Enums;
using FluentValidation;

namespace DrAutoTest.Application.Validators;

public class SendOtpRequestValidator : AbstractValidator<SendOtpRequest>
{
    public SendOtpRequestValidator()
    {
        RuleFor(x => x.PhoneOrEmail)
            .NotEmpty().WithMessage("Phone number or email is required.");

        RuleFor(x => x.PhoneOrEmail)
            .Matches(@"^\+?[1-9]\d{8,14}$")
            .When(x => x.OtpType == OtpType.Sms)
            .WithMessage("Invalid phone number format. Use international format, e.g., +998901234567.");

        RuleFor(x => x.PhoneOrEmail)
            .EmailAddress()
            .When(x => x.OtpType == OtpType.Email)
            .WithMessage("Invalid email address format.");

        RuleFor(x => x.OtpType)
            .IsInEnum().WithMessage("Invalid OTP type.");
    }
}
