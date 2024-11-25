using Microsoft.AspNetCore.Mvc;
using System.Threading;
using System.Threading.Tasks;
using Thread.NET.BLL.Services;
using Thread.NET.Common.DTO.User;

namespace Thread.NET.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AccountsController: ControllerBase
{
    private readonly AccountsService _accountsService;

    public AccountsController(AccountsService accountsService)
    {
        _accountsService = accountsService;
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordDTO dto, CancellationToken token)
    {
        await _accountsService.ForgotPassword(dto, token);
        return Ok();
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(ResetPasswordDTO dto, CancellationToken token)
    {
        await _accountsService.ResetPassword(dto, token);
        return Ok();
    }
}
