namespace Thread.NET.Common.DTO.Email;

public record SendEmailDTO(string ReceiverEmail, string HtmlContent, string Subject);