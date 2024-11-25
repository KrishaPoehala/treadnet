using AutoMapper;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Thread.NET.BLL.Emails;
using Thread.NET.BLL.Exceptions;
using Thread.NET.BLL.Services.Abstract;
using Thread.NET.Common.DTO.Email;
using Thread.NET.Common.DTO.User;
using Thread.NET.Common.Security;
using Thread.NET.DAL.Context;

namespace Thread.NET.BLL.Services;

public class AccountsService : BaseService
{
    private readonly IEmailSender _emailSender;
    public AccountsService(ThreadContext context, IMapper mapper, IEmailSender emailSender)
        : base(context, mapper)
    {
        _emailSender = emailSender;
    }

    public async Task ForgotPassword(ForgotPasswordDTO dto,CancellationToken cancellationToken = default)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Email == dto.Email, cancellationToken);

        if (user is null)
        {
            throw new NotFoundException(nameof(user));
        }

        var resetToken = Guid.NewGuid().ToString();
        user.ResetPasswordToken = resetToken;
        var param = new Dictionary<string, string?>
        {
            { "token", resetToken },
            { "email", dto.Email }
        };

        var callback = QueryHelpers.AddQueryString(dto.ClientURI, param);
        var message = new SendEmailDTO(user.Email, callback, "Reset your password");
        await Task.WhenAny(
         _emailSender.SendAsync(message, cancellationToken),
         _context.SaveChangesAsync(cancellationToken)
         );
    }

    public async Task ResetPassword(ResetPasswordDTO dto, CancellationToken token)
    {
        var user = await _context.Users
                    .FirstOrDefaultAsync(x => x.Email == dto.Email, token);

        if (user is null)
        {
            throw new NotFoundException(nameof(user));
        }

        if(user.ResetPasswordToken != dto.Token)
        {
            throw new InvalidTokenException(nameof(dto.Token));
        }
        var salt = SecurityHelper.GetRandomBytes();
        user.Salt = Convert.ToBase64String(salt);
        user.Password = SecurityHelper.HashPassword(dto.NewPassword, salt);
        await _context.SaveChangesAsync(token);
    }
}