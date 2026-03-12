import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { Model } from 'mongoose';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as cacheManager from 'cache-manager';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: cacheManager.Cache,
  ) {}

  async create(createPostDto: CreatePostDto, userId: string): Promise<Post> {
    const newPost = new this.postModel({ ...createPostDto, authorId: userId });
    return await newPost.save();
  }

  async findAll(page = 1, limit = 10) {
    const cacheKey = `posts-${page}-${limit}`;

    const cachedPosts = await this.cacheManager.get(cacheKey);

    if (cachedPosts) {
      console.log('serving from cache');
      return cachedPosts;
    }
    const skip = (page - 1) * limit;

    const posts = await this.postModel.find().skip(skip).limit(limit).sort({
      createdAt: -1,
    });

    await this.cacheManager.set(cacheKey, posts);

    return posts;
  }

  async findOne(id: string) {
    const post = await this.postModel.findById(id);
    if (!post) {
      throw new NotFoundException('post not found');
    }
    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    const post = await this.postModel.findByIdAndUpdate(id, updatePostDto, {
      new: true,
    });

    if (!post) {
      throw new NotFoundException('post not found');
    }
    return post;
  }

  async delete(id: string) {
    return await this.postModel.findByIdAndDelete(id);
  }
}
