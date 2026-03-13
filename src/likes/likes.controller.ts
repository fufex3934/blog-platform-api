import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post('posts/:postId')
  @UseGuards(JwtAuthGuard)
  likePost(
    @Param('postId') postId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.likesService.likePost(postId, userId);
  }

  @Delete('posts/:postId')
  @UseGuards(JwtAuthGuard)
  unlikePost(
    @Param('postId') postId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.likesService.unlikePost(userId, postId);
  }

  @Get('posts/:postId')
  getLikes(@Param('postId') postId: string) {
    return this.likesService.getLikes(postId);
  }
}
