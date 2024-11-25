import { Injectable } from '@angular/core';
import { AuthenticationService } from './auth.service';
import { Post } from '../models/post/post';
import { NewReaction } from '../models/reactions/newReaction';
import { PostService } from './post.service';
import { HttpInternalService } from './http-internal.service';

@Injectable({ providedIn: 'root' })
export class LikeService {
    public constructor(private http:HttpInternalService) {}

    private routePrefix = '/api'
    public likePost(model:NewReaction) {
       return this.http.postRequest(`${this.routePrefix}/posts/react`, model);
    }

    public likeComment(model:NewReaction){
        return this.http.postRequest(`${this.routePrefix}/comments/react`, model);
    }
}
