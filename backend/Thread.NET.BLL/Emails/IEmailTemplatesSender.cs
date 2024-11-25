using System.Threading;
using System.Threading.Tasks;
using Thread.NET.BLL.Emails.Models;

namespace Thread.NET.BLL.Emails;

public interface IEmailTemplatesSender
{
    Task SendPostWasLikedEmail(PostWasLikedModel model, CancellationToken cancellationToken = default);
}
