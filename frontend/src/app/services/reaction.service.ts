import { LikeService } from './like.service';
import { Injectable } from '@angular/core';
import { Reaction } from '../models/reactions/reaction';
import { NewReaction } from '../models/reactions/newReaction';
import { lastValueFrom } from 'rxjs';
import { AuthenticationService } from './auth.service';
import { SnackBarService } from './snack-bar.service';

@Injectable({
  providedIn: 'root'
})
export class ReactionService {

  constructor(
    private authService:AuthenticationService,
    private likeService: LikeService,
    private snackBarService:SnackBarService)
     { }

  public async addReaction(model:NewReaction,reactionType:'post'|'comment',
     positiveReactions:Reaction[], negativeReactions:Reaction[]){
    const user = await lastValueFrom(this.authService.getUser());
    if (!user) {
        return;
    }

    _removeReactionIfExists(positiveReactions);
    _removeReactionIfExists(negativeReactions);
    _addReactionTo(model.isLike ? positiveReactions : negativeReactions);

    let subscription = reactionType === 'post' ? this.likeService
        .likePost(model) : this.likeService.likeComment(model);

    subscription.subscribe({ error: (error) => this.snackBarService.showErrorMessage(error) });

    function _addReactionTo(arr: Reaction[]) {
        const reaction: Reaction = {
            isLike: model.isLike,
            user: user,
            createdOrUpdatedAt: new Date(),
        }

        arr.push(reaction);
    }

    function _removeReactionIfExists(reactions: Reaction[]) {
        const index = reactions.findIndex(x => x.user.id === user.id);
        if (index === -1) {
            return;
        }

        reactions.splice(index, 1);
    }
  }
}
