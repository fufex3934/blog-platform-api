import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CommentDocument = HydratedDocument<Comment>;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, index: true })
  postId: string;

  @Prop({ type: Types.ObjectId, ref: 'Comment', default: null })
  parentId?: Types.ObjectId;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

// Index for faster queries on postId + parentId
CommentSchema.index({ postId: 1, parentId: 1 });
