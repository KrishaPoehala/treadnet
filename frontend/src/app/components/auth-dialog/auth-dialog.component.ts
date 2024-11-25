import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogType } from '../../models/common/auth-dialog-type';
import { Subject } from 'rxjs';
import { AuthenticationService } from '../../services/auth.service';
import { takeUntil } from 'rxjs/operators';
import { SnackBarService } from '../../services/snack-bar.service';

@Component({
    templateUrl: './auth-dialog.component.html',
    styleUrls: ['./auth-dialog.component.sass']
})
export class AuthDialogComponent implements OnInit, OnDestroy {
    public dialogType = DialogType;
    public userName: string;
    public password: string;
    public avatar: string;
    public email: string;

    public hidePass = true;
    public title: string;
    private unsubscribe$ = new Subject<void>();

    constructor(
        private dialogRef: MatDialogRef<AuthDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private authService: AuthenticationService,
        private snackBarService: SnackBarService
    ) { }

    public ngOnInit() {
        this.avatar = 'https://avatars.mds.yandex.net/get-ott/374297/2a000001616b87458162c9216ccd5144e94d/orig';
        this.title = this._getTitle();
    }

    private _getTitle() {
        if (this.data.dialogType === DialogType.SignIn) {
            return 'Glad to see you back!';
        }

        if (this.data.dialogType === DialogType.SignUp) {
            return 'Tell us who you are and sign up.';
        }

        return 'Forgot your password?';
    }
    public ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    public close() {
        this.dialogRef.close(false);
    }

    public signIn() {
        this.authService
            .login({ email: this.email, password: this.password })
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((response) => this.dialogRef.close(response), (error) => this.snackBarService.showErrorMessage(error));
    }

    public signUp() {
        this.authService
            .register({ userName: this.userName, password: this.password, email: this.email, avatar: this.avatar })
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((response) => this.dialogRef.close(response), (error) => this.snackBarService.showErrorMessage(error));
    }

    private successLinkSent = 'The link to reset your password has been sent to your email!';
    public forgotPassword() {
        this.authService
            .forgotPassword({ email: this.email, clientUri: `${document.location.origin}/reset-password` })
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe({
                next: (_) => {
                    this.snackBarService.showUsualMessage(this.successLinkSent);
                    this.dialogRef.close();
                },
                error: (error) => this.snackBarService.showErrorMessage(error)
            });
    }

    public handleSubmit() {
        if (this.data.dialogType === this.dialogType.SignUp) {
            this.signUp();
            return;
        }

        if (this.data.dialogType === this.dialogType.SignIn) {
            this.signIn();
            return;
        }

        this.forgotPassword();
    }
}
