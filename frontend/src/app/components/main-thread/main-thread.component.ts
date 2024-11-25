import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Post } from '../../models/post/post';
import { User } from '../../models/user';
import { Subject, fromEvent } from 'rxjs';
import { MatSlideToggle, MatSlideToggleChange } from '@angular/material/slide-toggle';
import { AuthenticationService } from '../../services/auth.service';
import { PostService } from '../../services/post.service';
import { AuthDialogService } from '../../services/auth-dialog.service';
import { DialogType } from '../../models/common/auth-dialog-type';
import { EventService } from '../../services/event.service';
import { NewPost } from '../../models/post/new-post';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { SnackBarService } from '../../services/snack-bar.service';
import { environment } from 'src/environments/environment';
import { GyazoService } from 'src/app/services/gyazo.service';

@Component({
    selector: 'app-main-thread',
    templateUrl: './main-thread.component.html',
    styleUrls: ['./main-thread.component.sass']
})
export class MainThreadComponent implements OnInit, OnDestroy {
    public posts: Post[] = [];
    public cachedPosts: Post[] = [];
    public isOnlyMine = false;
    public isOnlyLiked = false;
    public currentUser: User;
    public imageUrl: string;
    public imageFile: File;
    public post = {} as NewPost;
    public showPostContainer = false;
    public loading = false;
    public loadingPosts = false;

    public postHub: HubConnection;

    private unsubscribe$ = new Subject<void>();

    public constructor(
        private snackBarService: SnackBarService,
        private authService: AuthenticationService,
        private postService: PostService,
        private gyazoService: GyazoService,
        private authDialogService: AuthDialogService,
        private eventService: EventService,
    ) { }

    public ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
        this.postHub.stop();
    }

    public ngOnInit() {
        this.registerHub();
        this.getPosts();
        this.getUser();
        this.eventService.userChangedEvent$.pipe(takeUntil(this.unsubscribe$)).subscribe((user) => {
            this.currentUser = user;
            this.post.authorId = this.currentUser ? this.currentUser.id : undefined;
        });

        fromEvent(window, 'scroll')
            .pipe(
                distinctUntilChanged(),
                filter(() => this.isScrolledToBottom() 
                    && !this.loadingPosts && !this.userSeenAllPosts),
                map(() => this.loadMorePosts())
            )
            .subscribe();
    }

    isScrolledToBottom(): boolean {
        const windowHeight = 'innerHeight' in window ? window.innerHeight : document.documentElement.offsetHeight;
        const body = document.body;
        const html = document.documentElement;
        const documentHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
        const windowBottom = windowHeight + window.pageYOffset;
        return windowBottom / documentHeight > 0.9;
    }

    page = 1;
    userSeenAllPosts = false;
    loadMorePosts() {
        this.loadingPosts = true;
        this.postService
            .getPosts(this.page)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe({
                next: (result) => {
                    this.posts.push(...this._getFilteredPosts(result.body));
                    this.cachedPosts.push(...result.body);
                    ++this.page;
                    console.log(this.posts);
                    this.userSeenAllPosts = result.body.length <= 0;
                    setTimeout(()=> this.loadingPosts = false, 50);
                },
                error: (error) => {
                    this.loadingPosts = false;
                    this.snackBarService.showErrorMessage(error);
                }
            });
    }

    public getPosts() {
        this.loadingPosts = true;
        this.postService
            .getPosts()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(
                (resp) => {
                    this.loadingPosts = false;
                    this.cachedPosts = resp.body;
                    this.posts = [...this.cachedPosts];
                },
                (error) => (this.loadingPosts = false)
            );
    }

    public sendPost() {
        const postSubscription = !this.imageFile
            ? this.postService.createPost(this.post)
            : this.gyazoService.uploadImage(this.imageFile).pipe(
                switchMap((imageData) => {
                    this.post.previewImage = imageData.url;
                    return this.postService.createPost(this.post);
                })
            );

        this.loading = true;

        postSubscription.pipe(takeUntil(this.unsubscribe$)).subscribe(
            (respPost) => {
                this.addNewPost(respPost.body);
                this.removeImage();
                this.post.body = undefined;
                this.post.previewImage = undefined;
                this.loading = false;
            },
            (error) => this.snackBarService.showErrorMessage(error)
        );
    }

    public loadImage(target: any) {
        this.imageFile = target.files[0];

        if (!this.imageFile) {
            target.value = '';
            return;
        }

        if (this.imageFile.size / 1000000 > 5) {
            target.value = '';
            this.snackBarService.showErrorMessage(`Image can't be heavier than ~5MB`);
            return;
        }

        const reader = new FileReader();
        reader.addEventListener('load', () => (this.imageUrl = reader.result as string));
        reader.readAsDataURL(this.imageFile);
    }

    public removeImage() {
        this.imageUrl = undefined;
        this.imageFile = undefined;
    }

    private _getFilteredPosts(postsToFilter:Post[]) {
        let filteredPosts: Post[] = [...postsToFilter];
        if (this.isOnlyLiked) {
            filteredPosts = filteredPosts.filter(x =>
                x.reactions.some(x => x.user.id === this.currentUser.id
                    && x.isLike
                ));
        }

        if (this.isOnlyMine) {
            filteredPosts = filteredPosts.filter((x) => x.author.id === this.currentUser.id);
        }

        return filteredPosts;
    }
    public onlyMineSliderChange(event: MatSlideToggleChange) {
        this.isOnlyMine = event.checked;
        this.posts = this._getFilteredPosts(this.cachedPosts);
    }

    public onlyLikedSliderChange(event: MatSlideToggleChange) {
        this.isOnlyLiked = event.checked;
        this.posts = this._getFilteredPosts(this.cachedPosts);
    }

    public toggleNewPostContainer() {
        this.showPostContainer = !this.showPostContainer;
    }

    public openAuthDialog() {
        this.authDialogService.openAuthDialog(DialogType.SignIn);
    }

    public registerHub() {
        this.postHub = new HubConnectionBuilder().withUrl(`${environment.apiUrl}/notifications/post`).build();
        this.postHub.start().catch((error) => this.snackBarService.showErrorMessage(error));

        this.postHub.on('NewPost', (newPost: Post) => {
            if (newPost) {
                this.addNewPost(newPost);
            }
        });
    }

    public addNewPost(newPost: Post) {
        if (!this.cachedPosts.some((x) => x.id === newPost.id)) {
            this.cachedPosts = this.sortPostArray(this.cachedPosts.concat(newPost));
            if (!this.isOnlyMine || (this.isOnlyMine && newPost.author.id === this.currentUser.id)) {
                this.posts = this.sortPostArray(this.posts.concat(newPost));
            }
        }
    }

    private getUser() {
        this.authService
            .getUser()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((user) => (this.currentUser = user));
    }

    private sortPostArray(array: Post[]): Post[] {
        return array.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    }

    public onDeletePost(postToDeleteId: number) {
        _deletePostFrom(this.posts);
        _deletePostFrom(this.cachedPosts);
        this.postService
            .deletePost(postToDeleteId)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe();

        function _deletePostFrom(innerPosts: Post[]) {
            const postIndex = innerPosts.findIndex(x => x.id === postToDeleteId);
            if (postIndex === -1) {
                return;
            }

            innerPosts.splice(postIndex, 1);
        }
    }
}
