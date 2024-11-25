using System;

namespace Thread.NET.BLL.Exceptions;

public class FailedSendingException: Exception
{
    public FailedSendingException():base("Failed to send an email")
    {
    }
}
