using AutoMapper;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Thread.NET.BLL.Exceptions;
using Thread.NET.BLL.Hubs;
using Thread.NET.BLL.Services.Abstract;
using Thread.NET.Common.DTO.Post;
using Thread.NET.Common.Logic.Abstractions;
using Thread.NET.DAL.Context;
using Thread.NET.DAL.Entities;

namespace Thread.NET.BLL.Services
{
    public sealed class PostService : BaseService
    {
        private readonly IHubContext<PostHub,IHubClient> _postHub;
        private readonly IUserIdGetter _userIdGetter;
        public PostService(ThreadContext context, IMapper mapper, 
            IHubContext<PostHub, IHubClient> postHub, IUserIdGetter userIdGetter)
            : base(context, mapper)
        {
            _postHub = postHub;
            _userIdGetter = userIdGetter;
        }

        public async Task<ICollection<PostDTO>> GetPaginatedPosts(GetPostsDto dto)
        {
            var posts = await _context.Posts
                .Include(post => post.Author)
                    .ThenInclude(author => author.Avatar)
                .Include(post => post.Preview)
                .Include(post => post.Reactions)
                    .ThenInclude(reaction => reaction.User)
                .Include(post => post.Comments)
                    .ThenInclude(comment => comment.Reactions)
                .Include(post => post.Comments)
                    .ThenInclude(comment => comment.Author)
                .OrderByDescending(post => post.CreatedAt)
                .Skip(dto.PageSize * dto.Page)
                .Take(dto.PageSize)
                .ToListAsync();

            return _mapper.Map<ICollection<PostDTO>>(posts);
        }

        public async Task<PostDTO> CreatePost(PostCreateDTO postDto)
        {
            var postEntity = _mapper.Map<Post>(postDto);

            _context.Posts.Add(postEntity);
            await _context.SaveChangesAsync();

            var createdPost = await _context.Posts
                .Include(post => post.Author)
					.ThenInclude(author => author.Avatar)
                .FirstAsync(post => post.Id == postEntity.Id);

            var createdPostDTO = _mapper.Map<PostDTO>(createdPost);
            await _postHub.Clients.All.NewPost(createdPostDTO);

            return createdPostDTO;
        }

        public async Task DeletePost(int id, CancellationToken cancellationToken = default)
        {
            var postToDelete = await _context.Posts
                .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
            if(postToDelete is null)
            {
                throw new NotFoundException(nameof(postToDelete), id);
            }

            postToDelete.IsDeleted = true;
            await _context.SaveChangesAsync(cancellationToken);
            await _postHub.Clients.All.PostDeleted(id, cancellationToken);
        }

        public async Task EditPost(EditPostDTO editDto, CancellationToken cancellationToken)
        {
            var postToEdit = await _context.Posts
                .FirstOrDefaultAsync(x => x.Id == editDto.Id, cancellationToken);
            if(postToEdit is null)
            {
                throw new NotFoundException(nameof(postToEdit), editDto.Id);
            }

            var newImage = new Image()
            {
                URL = editDto.PreviewImage,
            };

            _context.Images.Add(newImage);
            postToEdit.Body = editDto.Body;
            postToEdit.Preview = newImage;
            await _context.SaveChangesAsync(cancellationToken);
            await _postHub.Clients.All.PostEdited(_mapper.Map<PostDTO>(postToEdit), cancellationToken);
        }
    }
}
