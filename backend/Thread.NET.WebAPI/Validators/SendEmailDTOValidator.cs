using FluentValidation;
using Thread.NET.Common.DTO.Email;

namespace Thread.NET.Validators;

public class SendEmailDTOValidator:AbstractValidator<SendEmailDTO>
{
    public SendEmailDTOValidator()
    {
        RuleFor(x => x.ReceiverEmail)
            .NotNull()
            .NotEmpty()
            .WithMessage("Reveiver email should not be null or empty")
            .EmailAddress()
            .WithMessage("Invalid reveiver email format");

        RuleFor(x => x.HtmlContent)
            .NotNull()
            .NotEmpty()
            .WithMessage("Html content should not be null or empty");

        RuleFor(x => x.Subject)
            .NotNull()
            .NotEmpty()
            .WithMessage("Subject should not be null or empty");
    }
}
