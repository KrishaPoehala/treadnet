import { Injectable } from '@angular/core';
import { HttpInternalService } from './http-internal.service';
import { Post } from '../models/post/post';
import { NewReaction } from '../models/reactions/newReaction';
import { NewPost } from '../models/post/new-post';
import { EditPost } from '../models/post/edit-post';
import { HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class PostService {
    public routePrefix = '/api/posts';

    constructor(private httpService: HttpInternalService) {}

    public getPosts(page:number = 0,pageSize = 10) {
        const params = new HttpParams()
        .set('page', page.toString())
        .set('pageSize', pageSize.toString())
  
        return this.httpService.getFullRequest<Post[]>(`${this.routePrefix}`,params);
    }

    public createPost(post: NewPost) {
        return this.httpService.postFullRequest<Post>(`${this.routePrefix}`, post);
    }

    public likePost(reaction: NewReaction) {
        return this.httpService.postFullRequest<Post>(`${this.routePrefix}/like`, reaction);
    }

    public deletePost(postToDeleteId:number){
        return this.httpService.deleteFullRequest(`${this.routePrefix}/delete/${postToDeleteId}`);
    }

    public editPost(model:EditPost){
        return this.httpService.putFullRequest(`${this.routePrefix}/edit`, model);
    }
}
