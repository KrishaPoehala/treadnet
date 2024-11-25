using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using Thread.NET.Common.DTO.Post;

namespace Thread.NET.BLL.Hubs
{
    public sealed class PostHub : Hub<IHubClient>
    {
        public async Task Send(PostDTO post)
        {
            await Clients.All.NewPost(post);
        }
    }
}
