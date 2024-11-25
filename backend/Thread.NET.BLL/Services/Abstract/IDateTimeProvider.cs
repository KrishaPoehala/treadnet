using System;

namespace Thread.NET.BLL.Services.Abstract;

public interface IDateTimeProvider
{
    DateTime Now { get; }
}
