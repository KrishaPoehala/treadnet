import { Injectable } from '@angular/core';
import { HttpInternalService } from './http-internal.service';
import { NewComment } from '../models/comment/new-comment';
import { Comment } from '../models/comment/comment';
import { EditComment } from '../models/comment/edit-comment';

@Injectable({ providedIn: 'root' })
export class CommentService {
    public routePrefix = '/api/comments';

    constructor(private httpService: HttpInternalService) {}

    public createComment(post: NewComment) {
        return this.httpService.postFullRequest<Comment>(`${this.routePrefix}`, post);
    }

    public deleteComment(id:number){
        return this.httpService.deleteFullRequest(`${this.routePrefix}/delete/${id}`);
    }

    public editComment(model:EditComment){
        return this.httpService.putFullRequest(`${this.routePrefix}/edit`, model);
    }
}
