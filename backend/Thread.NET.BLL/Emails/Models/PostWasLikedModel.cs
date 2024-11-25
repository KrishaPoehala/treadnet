using System;
using Thread.NET.Common.DTO.Post;
using Thread.NET.Common.DTO.User;

namespace Thread.NET.BLL.Emails.Models;

public record PostWasLikedModel(PostDTO Post,UserDTO LikedBy,DateTime LikedAt);