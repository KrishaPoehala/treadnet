using System.Threading.Tasks;
using System.Threading;
using Thread.NET.Common.DTO.Email;

namespace Thread.NET.BLL.Emails;

public interface IEmailSender
{
    Task SendAsync(SendEmailDTO dto, CancellationToken cancellationToken = default);
}
