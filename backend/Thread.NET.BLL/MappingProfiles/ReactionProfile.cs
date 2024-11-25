using AutoMapper;
using Thread.NET.Common.DTO.Like;
using Thread.NET.DAL.Entities;
using Thread.NET.DAL.Entities.Abstract;

namespace Thread.NET.BLL.MappingProfiles
{
    public sealed class ReactionProfile : Profile
    {
        public ReactionProfile()
        {
            CreateMap<Reaction, ReactionDTO>()
                .ForMember(x => x.CreatedOrUpdatedAt,
                    x => x.MapFrom(y => y.UpdatedAt > y.CreatedAt ? y.UpdatedAt : y.CreatedAt))
                .ReverseMap();
            CreateMap<NewReactionDTO, PostReaction>()
                .ForMember(x => x.PostId, x => x.MapFrom(x => x.EntityId));
            CreateMap<NewReactionDTO, CommentReaction>()
                .ForMember(x => x.CommentId, x => x.MapFrom(x => x.EntityId));
        }   
    }
}
