using System.Threading;
using System.Threading.Tasks;
using Thread.NET.Common.DTO.Post;

namespace Thread.NET.BLL.Hubs;

public interface IHubClient
{
    Task PostDeleted(int postId, CancellationToken cancellationToken = default);
    Task PostEdited(PostDTO post, CancellationToken cancellationToken = default);
    Task NewPost(PostDTO post, CancellationToken cancellationToken = default);
}
