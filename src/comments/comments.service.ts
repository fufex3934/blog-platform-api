import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { Model } from 'mongoose';
import { CreateCommentDto } from './dto/create-comment.dto';

import { Types } from 'mongoose';

export interface CommentWithReplies extends Comment {
  _id: Types.ObjectId | string; // add _id explicitly
  replies: CommentWithReplies[];
}

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

  async findByPost(postId: string): Promise<CommentWithReplies[]> {
    const topComments = await this.commentModel
      .find({ postId, parentId: null })
      .sort({ createdAt: -1 })
      .lean();

    const allReplies = await this.commentModel
      .find({ postId, parentId: { $ne: null } })
      .sort({ createdAt: 1 })
      .lean();

    // attach replies
    const commentMap: CommentWithReplies[] = topComments.map((c) => ({
      ...c,
      replies: [],
    }));
    const idMap = new Map(commentMap.map((c) => [c._id.toString(), c]));

    allReplies.forEach((reply) => {
      if (!reply.parentId) return;
      const parent = idMap.get(reply.parentId.toString());
      if (parent) parent.replies.push({ ...reply, replies: [] });
    });

    return commentMap;
  }
}
