using DrAutoTest.Domain.Enums;

namespace DrAutoTest.Application.DTOs.Auth;

public class SendOtpRequest
{
    public string PhoneOrEmail { get; set; } = string.Empty;
    public OtpType OtpType { get; set; }
}
