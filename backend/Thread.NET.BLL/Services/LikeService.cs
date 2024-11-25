using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Thread.NET.BLL.Emails;
using Thread.NET.BLL.Emails.Models;
using Thread.NET.BLL.Services.Abstract;
using Thread.NET.Common.DTO.Like;
using Thread.NET.Common.DTO.Post;
using Thread.NET.Common.DTO.User;
using Thread.NET.DAL.Context;
using Thread.NET.DAL.Entities;

namespace Thread.NET.BLL.Services
{
    public sealed class LikeService : BaseService
    {
        private readonly IDateTimeProvider _dateTimeProvider;
        private readonly IEmailTemplatesSender _templatesSender;
        public LikeService(ThreadContext context, IMapper mapper,
            IDateTimeProvider dateTimeProvider, IEmailTemplatesSender templatesSender)
            : base(context, mapper)
        {
            _dateTimeProvider = dateTimeProvider;
            _templatesSender = templatesSender;
        }

        //i wanted to generalize this code and make in one function but after trying a bit, 
        //It turned out the code was getting too complicated so I lived it as is
        public async Task LikeComment(NewReactionDTO reactionDto, CancellationToken token = default) 
        {
            var oldReaction = await _context
                .CommentReactions
                .FirstOrDefaultAsync(x => x.UserId == reactionDto.UserId 
                && x.CommentId == reactionDto.EntityId, token);

            if (oldReaction is not null)
            {
                oldReaction.IsLike = reactionDto.IsLike;
                oldReaction.UpdatedAt = _dateTimeProvider.Now;
            }
            else
            {
                var newReaction = _mapper.Map<CommentReaction>(reactionDto);
                _context.CommentReactions.Add(newReaction);
            }

            await _context.SaveChangesAsync(token);
        }

        public async Task LikePost(NewReactionDTO reactionDto, CancellationToken token = default)
        {
            var oldReaction = await _context
                .PostReactions
                .FirstOrDefaultAsync(x => x.UserId == reactionDto.UserId
                && x.PostId == reactionDto.EntityId, token);

            if (oldReaction is not null)
            {
                oldReaction.IsLike = reactionDto.IsLike;
                oldReaction.UpdatedAt = _dateTimeProvider.Now;
            }
            else
            {
                var newReaction = _mapper.Map<PostReaction>(reactionDto);
                _context.PostReactions.Add(newReaction);
            }

            await _context.SaveChangesAsync(token);
            if (reactionDto.IsLike) 
            {
                await SendNotificationEmailToAuthor(reactionDto, token);
            }
        }

        private async Task SendNotificationEmailToAuthor(NewReactionDTO reactionDto, CancellationToken token)
        {
            var post = await _context.Posts
                .Include(x => x.Author)
                .Include(x => x.Preview)
                .FirstOrDefaultAsync(x => x.Id == reactionDto.EntityId, token);

            var likedBy = await _context.Users
                .FirstOrDefaultAsync(x => x.Id == reactionDto.UserId, token);

            var postDto = _mapper.Map<PostDTO>(post);
            var likedByDto = _mapper.Map<UserDTO>(likedBy);
            var postWasLikedModel = new PostWasLikedModel(postDto, likedByDto, _dateTimeProvider.Now);
            await _templatesSender.SendPostWasLikedEmail(postWasLikedModel, token);
        }
    }
}
