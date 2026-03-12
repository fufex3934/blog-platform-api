import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PostsService } from '../posts.service';
import { Request } from 'express';

export interface UserWithRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@Injectable()
export class PostOwnerGuard implements CanActivate {
  constructor(private readonly postService: PostsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<UserWithRequest>();
    const paramsId = request.params.id;
    const postId = Array.isArray(paramsId) ? paramsId[0] : paramsId;

    const post = await this.postService.findOne(postId);
    const userId = request.user.id;

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('You are not owner of this post');
    }

    return true;
  }
}
