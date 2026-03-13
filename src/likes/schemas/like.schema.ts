import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type LikeDocument = HydratedDocument<Like>;

@Schema({ timestamps: true })
export class Like {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, index: true })
  postId: string;
}

export const LikeSchema = SchemaFactory.createForClass(Like);

//prevent duplicate likes
LikeSchema.index({ userId: 1, postId: 1 }, { unique: true });
