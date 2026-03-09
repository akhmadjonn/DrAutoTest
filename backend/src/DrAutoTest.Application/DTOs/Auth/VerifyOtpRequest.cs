using DrAutoTest.Domain.Enums;

namespace DrAutoTest.Application.DTOs.Auth;

public class VerifyOtpRequest
{
    public string PhoneOrEmail { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public OtpType OtpType { get; set; }
}
