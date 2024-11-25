using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;
using Thread.NET.BLL.Exceptions;
using Thread.NET.BLL.Services.Abstract;
using Thread.NET.Common.DTO.Comment;
using Thread.NET.Common.DTO.Like;
using Thread.NET.DAL.Context;
using Thread.NET.DAL.Entities;

namespace Thread.NET.BLL.Services
{
    public sealed class CommentService : BaseService
    {
        public CommentService(ThreadContext context, IMapper mapper) : base(context, mapper) { }

        public async Task<CommentDTO> CreateComment(NewCommentDTO newComment)
        {
            var commentEntity = _mapper.Map<Comment>(newComment);

            _context.Comments.Add(commentEntity);
            await _context.SaveChangesAsync();

            var createdComment = await _context.Comments
                .Include(comment => comment.Author)
                    .ThenInclude(user => user.Avatar)
                .FirstAsync(comment => comment.Id == commentEntity.Id);

            return _mapper.Map<CommentDTO>(createdComment);
        }

        public async Task DeleteComment(int id, CancellationToken token)
        {
            var commentToDelete = await _context.Comments
                .FirstOrDefaultAsync(x => x.Id == id, token);

            if(commentToDelete is null) 
            {
                throw new NotFoundException(nameof(commentToDelete), id);
            }

            commentToDelete.IsDeleted = true;
            await _context.SaveChangesAsync(token);
        }

        public async Task EditComment(EditCommentDTO editComment, CancellationToken token)
        {
            var commentToEdit = await _context.Comments
                .FirstOrDefaultAsync(x => x.Id == editComment.CommentId, token);

            if (commentToEdit is null) 
            {
                throw new NotFoundException(nameof(commentToEdit), editComment.CommentId);
            }

            commentToEdit.Body = editComment.Body;
            await _context.SaveChangesAsync(token);
        }
    }
}
