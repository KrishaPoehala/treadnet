using FluentValidation;
using Microsoft.Extensions.Options;
using SendGrid;
using SendGrid.Helpers.Mail;
using System.Threading;
using System.Threading.Tasks;
using Thread.NET.BLL.Exceptions;
using Thread.NET.Common.DTO.Email;

namespace Thread.NET.BLL.Emails;

public class EmailSender : IEmailSender
{
    private readonly SendEmailOptions _options;
    private readonly IValidator<SendEmailDTO> _validator;
    public EmailSender(IOptions<SendEmailOptions> settings, IValidator<SendEmailDTO> validator)
    {
        _options = settings.Value;
        _validator = validator;
    }

    private async Task SendAsync(string to, string content, string subject, CancellationToken cancellationToken = default)
    {
        var client = new SendGridClient(_options.ApiKey);
        var message = new SendGridMessage()
        {
            From = new EmailAddress(_options.FromEmail, _options.FromName),
            Subject = subject,
            HtmlContent = content,
        };

        message.AddTo(to);
        var response = await client.SendEmailAsync(message, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            throw new FailedSendingException();
        }
    }

    public async Task SendAsync(SendEmailDTO dto, CancellationToken cancellationToken = default)
    {
        await _validator.ValidateAndThrowAsync(dto, cancellationToken);
        await SendAsync(dto.ReceiverEmail, dto.HtmlContent, dto.Subject, cancellationToken);
    }
}
