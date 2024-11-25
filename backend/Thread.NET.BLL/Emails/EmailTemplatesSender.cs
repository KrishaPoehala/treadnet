using System.Threading;
using System.Threading.Tasks;
using Thread.NET.BLL.Emails.Helper;
using Thread.NET.BLL.Emails.Models;
using Thread.NET.Common.DTO.Email;

namespace Thread.NET.BLL.Emails;

public class EmailTemplatesSender : IEmailTemplatesSender
{
    private readonly IEmailSender _emailSender;
    //since i already have separate abstractions for sending emails and for sending razor template emails,
    //i decided not to add another layer of abstraction to this class
    private readonly RazorParser _parser;
    public EmailTemplatesSender(IEmailSender emailSender, RazorParser parser)
    {
        _emailSender = emailSender;
        _parser = parser;
    }

    public async Task SendPostWasLikedEmail(PostWasLikedModel model, CancellationToken cancellationToken = default)
    {
        string template = @"Emails.Templates.PostWasLikedTemplate";
        var body = await _parser.ParseRazorTemplate(template, model);
        var sendEmailDto = new SendEmailDTO(model.Post.Author.Email, body, "Success");
        await _emailSender.SendAsync(sendEmailDto, cancellationToken);
    }
}