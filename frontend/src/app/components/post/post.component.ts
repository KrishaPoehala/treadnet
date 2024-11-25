import { MatIconModule } from '@angular/material/icon';
import { GyazoService } from './../../services/gyazo.service';
import { Component, EventEmitter, Input, OnDestroy, Output, OnInit } from '@angular/core';
import { Post } from '../../models/post/post';
import { AuthenticationService } from '../../services/auth.service';
import { AuthDialogService } from '../../services/auth-dialog.service';
import { empty, lastValueFrom, Observable, Subject } from 'rxjs';
import { DialogType } from '../../models/common/auth-dialog-type';
import { LikeService } from '../../services/like.service';
import { NewComment } from '../../models/comment/new-comment';
import { CommentService } from '../../services/comment.service';
import { User } from '../../models/user';
import { Comment } from '../../models/comment/comment';
import { catchError, switchMap, takeUntil } from 'rxjs/operators';
import { SnackBarService } from '../../services/snack-bar.service';
import { PostService } from '../../services/post.service';
import { EditPost } from '../../models/post/edit-post';
import { HttpResponse } from '@microsoft/signalr';
import { NewReaction } from '../../models/reactions/newReaction';
import { Reaction } from '../../models/reactions/reaction';
import { MatDialog } from '@angular/material/dialog';
import { ReactionsInfoComponent } from '../reactions-info/reactions-info.component';
import { ReactionService } from 'src/app/services/reaction.service';

@Component({
    selector: 'app-post',
    templateUrl: './post.component.html',
    styleUrls: ['./post.component.sass']
})
export class PostComponent implements OnInit, OnDestroy {
    @Input() public post: Post;
    @Input() public currentUser: User;
    @Output() deletePostEmmiter: EventEmitter<number> = new EventEmitter();
    public showComments = false;
    public isEditingMode = false
    public newComment = {} as NewComment;
    public positiveReactions: Reaction[] = [];
    public negativeReactions: Reaction[] = [];

    private unsubscribe$ = new Subject<void>();

    public constructor(
        private authService: AuthenticationService,
        private authDialogService: AuthDialogService,
        private commentService: CommentService,
        private snackBarService: SnackBarService,
        private postService: PostService,
        private gyazoService: GyazoService,
        private dialog: MatDialog,
        private reactionService:ReactionService,
    ) { }

    ngOnInit(): void {
        console.log(this.currentUser);
        this.selectedPhoto = this.post.previewImage;
        this.positiveReactions = this.post.reactions.filter(x => x.isLike);
        this.negativeReactions = this.post.reactions.filter(x => !x.isLike);
    }

    public ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    public toggleComments() {
        if (!this.currentUser) {
            this.catchErrorWrapper(this.authService.getUser())
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe((user) => {
                    if (user) {
                        this.currentUser = user;
                        this.showComments = !this.showComments;
                    }
                });
            return;
        }

        this.showComments = !this.showComments;
    }

    public async addReaction(isLike: boolean) {
        const model: NewReaction = {
            entityId: this.post.id,
            isLike: isLike,
            userId: null,
        }

        let reaction:Reaction = {
            user:this.currentUser,
            isLike:isLike,
            createdOrUpdatedAt:new Date(),
        }
        
        this.post.reactions.push(reaction);
        await this.reactionService.addReaction(model, 'post', 
            this.positiveReactions, this.negativeReactions);
    }

    public deletePost() {
        this.deletePostEmmiter.emit(this.post.id);
    }

    public editPostToggle() {
        this.isEditingMode = !this.isEditingMode;
    }

    public sendComment() {
        this.newComment.authorId = this.currentUser.id;
        this.newComment.postId = this.post.id;

        this.commentService
            .createComment(this.newComment)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(
                (resp) => {
                    if (resp) {
                        this.post.comments = this.sortCommentArray(this.post.comments.concat(resp.body));
                        this.newComment.body = undefined;
                    }
                },
                (error) => this.snackBarService.showErrorMessage(error)
            );
    }

    public openAuthDialog() {
        this.authDialogService.openAuthDialog(DialogType.SignIn);
    }

    private catchErrorWrapper(obs: Observable<User>) {
        return obs.pipe(
            catchError(() => {
                this.openAuthDialog();
                return empty();
            })
        );
    }

    private sortCommentArray(array: Comment[]): Comment[] {
        return array.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    }

    selectedPhoto: string | null;
    selectedFile: Blob | null;
    public onFileSelected(event: any) {
        this.selectedFile = event.target.files[0];
        if (this.selectedFile) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.selectedPhoto = e.target.result;
            };
            reader.readAsDataURL(this.selectedFile);
        }
    }

    public editPost() {
        let editPostModel: EditPost = {
            id: this.post.id,
            previewImage: this.post.previewImage,
            body: this.post.body,
        };

        let postSubscription: Observable<any>;
        if (this.selectedPhoto !== this.post.previewImage && this.selectedFile) {
            postSubscription =
                this.gyazoService.uploadImage(this.selectedFile).pipe(
                    switchMap((imageData) => {
                        console.log(imageData);
                        editPostModel.previewImage = imageData.url;
                        this.post.previewImage = imageData.url;
                        return this.postService.editPost(editPostModel);
                    })
                );
        }
        else {
            postSubscription = this.postService.editPost(editPostModel);
        }

        postSubscription.pipe(takeUntil(this.unsubscribe$)).subscribe(
            (_) => this.isEditingMode = !this.isEditingMode,
            (error) => this.snackBarService.showErrorMessage(error)
        );
    }

    cancelPostPhoto() {
        this.selectedPhoto = null;
        this.post.previewImage = null;
        this.selectedFile = null;
    }

    onReactionsInfoDialogOpen() {
        const ref = this.dialog.open(ReactionsInfoComponent);
        ref.componentInstance.reactions = this.positiveReactions.concat(this.negativeReactions);
    }

    deleteComment(commentId:number){
        _deleteCommentFrom(this.post.comments);

        this.commentService.deleteComment(commentId)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({error:(error) => this.snackBarService.showErrorMessage(error)});
        function _deleteCommentFrom(comments: Comment[]) {
            const commentIndex = comments.findIndex(x => x.id === commentId);
            if(commentIndex === -1){
                return;
            }

            comments.splice(commentIndex, 1);
        }
    }
}

