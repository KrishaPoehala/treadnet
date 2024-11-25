using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading;
using System.Threading.Tasks;
using Thread.NET.BLL.Services;
using Thread.NET.Common.DTO.Comment;
using Thread.NET.Common.DTO.Like;
using Thread.NET.Common.Logic.Abstractions;

namespace Thread.NET.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
    [ApiController]
    public class CommentsController : ControllerBase
    {
        private readonly CommentService _commentService;
        private readonly LikeService _likeService;
        private readonly IUserIdGetter _userIdGetter;

        public CommentsController(CommentService commentService, IUserIdGetter userIdGetter, 
            LikeService likeService)
        {
            _commentService = commentService;
            _userIdGetter = userIdGetter;
            _likeService = likeService;
        }

        /// <summary>
        /// Adds new comment to post
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<CommentDTO>> CreatePost([FromBody] NewCommentDTO comment)
        {
            comment.AuthorId = _userIdGetter.CurrentUserId;
            return Ok(await _commentService.CreateComment(comment));
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(int id, CancellationToken token)
        {
            await _commentService.DeleteComment(id, token);
            return Ok();
        }

        [HttpPut("edit")]
        public async Task<IActionResult> Edit(EditCommentDTO editComment,CancellationToken token)
        {
            await _commentService.EditComment(editComment, token);
            return Ok();
        }

        [HttpPost("react")]
        public async Task<IActionResult> AddReaction(NewReactionDTO reaction, CancellationToken token)
        {
            reaction.UserId = _userIdGetter.CurrentUserId;
            await _likeService.LikeComment(reaction, token);
            return Ok();
        }
    }
}