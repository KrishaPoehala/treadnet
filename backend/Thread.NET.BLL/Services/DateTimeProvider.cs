using System;
using Thread.NET.BLL.Services.Abstract;

namespace Thread.NET.BLL.Services;

public class DateTimeProvider : IDateTimeProvider
{
    public DateTime Now => DateTime.Now;
}
