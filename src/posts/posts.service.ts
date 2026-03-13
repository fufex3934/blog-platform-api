import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { Model } from 'mongoose';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as cacheManager from 'cache-manager';
import { Post as PostInterface } from './interfaces/post.interface';
import slugify from 'slugify';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: cacheManager.Cache,
  ) {}

  async create(createPostDto: CreatePostDto, userId: string): Promise<Post> {
    const slug = slugify(createPostDto.title, {
      lower: true,
      strict: true,
    });
    const newPost = new this.postModel({
      ...createPostDto,
      slug,
      authorId: userId,
    });
    const saved = await newPost.save();
    await this.cacheManager.clear();
    return saved;
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

  async findBySlug(slug: string): Promise<PostInterface | null> {
    const cacheKey = `post_${slug}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached as PostInterface;
    }
    const post = await this.postModel.findOne({ slug });
    if (!post) {
      throw new NotFoundException('post not found');
    }
    await this.cacheManager.set(cacheKey, post);
    return post as unknown as PostInterface;
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    const post = await this.postModel.findByIdAndUpdate(id, updatePostDto, {
      new: true,
    });

    if (!post) {
      throw new NotFoundException('post not found');
    }
    await this.cacheManager.del(`post_$(id)`);
    await this.cacheManager.clear();
    return post;
  }

  async delete(id: string) {
    await this.cacheManager.del(`post_$(id)`);
    await this.cacheManager.clear();
    return await this.postModel.findByIdAndDelete(id);
  }
}
