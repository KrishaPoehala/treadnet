import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { JwtInterceptor } from './helpers/jwt.interceptor';
import { ErrorInterceptor } from './helpers/error.interceptor';
import { RouterModule } from '@angular/router';
import { AppRoutes } from './app.routes';
import { FormsModule } from '@angular/forms';
import { MainThreadComponent } from './components/main-thread/main-thread.component';
import { PostComponent } from './components/post/post.component';
import { HomeComponent } from './components/home/home.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { AuthDialogComponent } from './components/auth-dialog/auth-dialog.component';
import { CommentComponent } from './components/comment/comment.component';
import { MaterialComponentsModule } from './components/common/material-components.module';
import { MatMenuModule } from '@angular/material/menu';
import { ReactionsInfoComponent } from './components/reactions-info/reactions-info.component';
import { TimeAgoPipe } from './pipes/time-ago.pipe';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';

@NgModule({
    declarations: [
        AppComponent,
        MainThreadComponent,
        PostComponent,
        HomeComponent,
        UserProfileComponent,
        AuthDialogComponent,
        CommentComponent,
        ReactionsInfoComponent,
        TimeAgoPipe,
        ResetPasswordComponent,
    ],
    imports: [
        BrowserModule, 
        BrowserAnimationsModule, 
        HttpClientModule, 
        MaterialComponentsModule,
        RouterModule.forRoot(AppRoutes), 
        FormsModule,
        MatMenuModule,
    ],
    exports: [MaterialComponentsModule],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }