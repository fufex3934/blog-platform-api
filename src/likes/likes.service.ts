import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Like, LikeDocument } from './schemas/like.schema';
import { Model } from 'mongoose';

@Injectable()
export class LikesService {
  constructor(@InjectModel(Like.name) private likeModel: Model<LikeDocument>) {}

  async likePost(userId: string, postId: string) {
    const like = new this.likeModel({
      userId,
      postId,
    });
    return like.save();
  }

  async unlikePost(userId: string, postId: string) {
    return this.likeModel.deleteOne({ userId, postId });
  }

  async getLikes(postId: string) {
    const count = await this.likeModel.countDocuments({ postId });
    return { likes: count };
  }
}
