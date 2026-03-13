import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { Model } from 'mongoose';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  async create(
    dto: CreateCommentDto,
    userId: string,
    postId: string,
  ): Promise<Comment> {
    const newComment = new this.commentModel({
      content: dto.content,
      userId,
      postId,
      parentId: dto.parentId || null,
    });
    return await newComment.save();
  }

  async findByPost(postId: string) {
    return await this.commentModel.find({ postId }).sort({ createdAt: -1 });
  }
}
