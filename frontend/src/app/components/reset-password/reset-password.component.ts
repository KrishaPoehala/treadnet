import { SnackBarService } from './../../services/snack-bar.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ResetPassword } from 'src/app/models/auth/reset-password';
import { AuthenticationService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit, OnDestroy {

  constructor(
    private route: ActivatedRoute,
    private authService:AuthenticationService,
    private snackBarService: SnackBarService,
    private router:Router
  ) { }
  model:ResetPassword;
  ngOnInit(): void {
    this.model = {
      token:'',
      email:'',
      newPassword:'',
      confirmPassword:'',
    }
    this.model.token = this.route.snapshot.queryParams['token'];
    this.model.email = this.route.snapshot.queryParams['email'];
  }
  
  private unsubscribe$ = new Subject<void>();
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  successResetMessage = 'Your password has been succefully reset';
  public resetPassword(){
    console.log('RRRRRRRRRRRRRR')
    this.authService
      .resetPassword(this.model)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next:(_) => {
          this.snackBarService.showUsualMessage(this.successResetMessage);
          this.router.navigateByUrl('')
        },
        error:(error) => this.snackBarService.showErrorMessage(error),
      });
    
  }
}
