/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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

  async findAll(page = 1, limit = 10, search?: string, tag?: string) {
    // Include search & tag in cache key to avoid conflicts
    const cacheKey = `posts-${page}-${limit}-${search || ''}-${tag || ''}`;

    // Try cache
    const cachedPosts = await this.cacheManager.get(cacheKey);
    if (cachedPosts) {
      console.log('serving from cache');
      return cachedPosts;
    }

    // Build filter
    const filter: any = {};
    if (search) filter.$text = { $search: search };
    if (tag) filter.tags = { $in: [tag] };

    const skip = (page - 1) * limit;

    // Fetch posts
    const posts = await this.postModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Optionally store count for pagination
    const total = await this.postModel.countDocuments(filter);

    // Cache the result with TTL (e.g., 60s)
    await this.cacheManager.set(cacheKey, { posts, total });

    return { posts, total };
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
