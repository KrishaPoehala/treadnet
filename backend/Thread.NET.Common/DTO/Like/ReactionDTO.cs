using System;
using Thread.NET.Common.DTO.User;

namespace Thread.NET.Common.DTO.Like
{
    public sealed class ReactionDTO
    {
        public bool IsLike { get; set; }
        public UserDTO User { get; set; }
        public DateTime CreatedOrUpdatedAt { get; set; }
    }
}
