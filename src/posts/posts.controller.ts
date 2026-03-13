import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostOwnerGuard } from './guards/post-owner.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CustomFileInterceptor } from 'src/common/interceptors/file-upload.interceptor';

@Controller('posts')
export class PostsController {
  constructor(private readonly postService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(CustomFileInterceptor('image'))
  async create(
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('userId') userId: string,
  ) {
    if (file) {
      createPostDto['imageUrl'] = `/uploads/${file.filename}`;
    }
    return this.postService.create(createPostDto, userId);
  }

  @Get()
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.postService.findAll(Number(page), Number(limit));
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    return this.postService.findBySlug(slug);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PostOwnerGuard)
  async update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postService.update(id, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PostOwnerGuard)
  async delete(id: string) {
    return this.postService.delete(id);
  }
}
