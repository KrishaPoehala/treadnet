using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading;
using System.Threading.Tasks;
using Thread.NET.BLL.Services;
using Thread.NET.Common.DTO.Like;
using Thread.NET.Common.DTO.Post;
using Thread.NET.Common.Logic.Abstractions;

namespace Thread.NET.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
    [ApiController]
    public class PostsController : ControllerBase
    {
        private readonly PostService _postService;
        private readonly LikeService _likeService;
        private readonly IUserIdGetter _userIdGetter;

        public PostsController(PostService postService, LikeService likeService, IUserIdGetter userIdGetter)
        {
            _postService = postService;
            _likeService = likeService;
            _userIdGetter = userIdGetter;
        }

        /// <summary>
        /// Get all existing posts
        /// </summary>
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> Get([FromQuery] int page,[FromQuery] int pageSize)
        {
            var dto = new GetPostsDto()
            {
                Page = page,
                PageSize = pageSize,
            };

            return Ok(await _postService.GetPaginatedPosts(dto));
        }

        /// <summary>
        /// Create new post for all users
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<PostDTO>> CreatePost([FromBody] PostCreateDTO dto)
        {
            dto.AuthorId = _userIdGetter.CurrentUserId;
            return Ok(await _postService.CreatePost(dto));
        } 

        /// <summary>
        /// Add a reaction (like or dislike) to post
        /// </summary>
        [HttpPost("react")]
        public async Task<IActionResult> AddReaction(NewReactionDTO reaction,CancellationToken token)
        {
            reaction.UserId = _userIdGetter.CurrentUserId;
            await _likeService.LikePost(reaction, token);
            return Ok();
        }
        /// <summary>
        ///   Deletes a post with given id
        /// </summary>
        /// <param name="id">id of the post</param>
        /// <param name="cancellationToken">cancelation token</param>
        /// <returns></returns>
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeletePost(int id, CancellationToken cancellationToken)
        {
            await _postService.DeletePost(id, cancellationToken);
            return Ok();
        }

        /// <summary>
        /// Edits a post
        /// </summary>
        /// <param name="editDto"></param>
        /// <param name="cancellationToken"></param>
        /// <returns></returns>
        [HttpPut("edit")]
        public async Task<IActionResult> EditPost(EditPostDTO editDto,CancellationToken cancellationToken)
        {
            await _postService.EditPost(editDto, cancellationToken);
            return Ok();
        }
    }
}