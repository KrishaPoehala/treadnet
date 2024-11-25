import { CommentService } from './../../services/comment.service';
import { SnackBarService } from './../../services/snack-bar.service';
import { ReactionService } from './../../services/reaction.service';
import { Component, Input, OnDestroy, OnInit, Output,EventEmitter } from '@angular/core';
import { Comment } from '../../models/comment/comment';
import { User } from 'src/app/models/user';
import { Reaction } from 'src/app/models/reactions/reaction';
import { NewReaction } from 'src/app/models/reactions/newReaction';
import { EditComment } from 'src/app/models/comment/edit-comment';
import { Subject, takeUntil } from 'rxjs';
import { ReactionsInfoComponent } from '../reactions-info/reactions-info.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-comment',
    templateUrl: './comment.component.html',
    styleUrls: ['./comment.component.sass']
})
export class CommentComponent implements OnDestroy,OnInit {
    @Input() public comment: Comment;
    @Input() public currentUser:User | null;
    @Output() public deleteCommentEmmiter:EventEmitter<number> = new EventEmitter();
    public positiveReactions: Reaction[] = [];
    public negativeReactions: Reaction[] = [];
    public isEditingMode = false;
    private unsubscribe$ = new Subject<void>();
    constructor(
        private reactionService: ReactionService,
        private snackBarService: SnackBarService,
        private commentService: CommentService,
        private dialog: MatDialog,
    )
    {}

    ngOnInit(): void {
        this.positiveReactions = this.comment.reactions.filter(x => x.isLike);
        this.negativeReactions = this.comment.reactions.filter(x => !x.isLike);
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    public async addReaction(isLike:boolean){
        const model:NewReaction={
            isLike:isLike,
            entityId:this.comment.id,
            userId:null,
        }

        await this.reactionService.addReaction(model, 'comment',
            this.positiveReactions,this.negativeReactions);
    }

    public editCommentToggle(){
        this.isEditingMode = !this.isEditingMode;
    }

    public editComment(){
        if(!this.comment.body){
            return;
        }

        const model:EditComment = {
            commentId:this.comment.id,
            body:this.comment.body,
        };

        this.commentService.editComment(model)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(
            (_) => this.isEditingMode = !this.isEditingMode,
            (error) => this.snackBarService.showErrorMessage(error)
            );
    }

    onReactionsInfoDialogOpen(){
        const ref = this.dialog.open(ReactionsInfoComponent);
        ref.componentInstance.reactions = this.positiveReactions.concat(this.negativeReactions);

    }
}
