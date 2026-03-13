import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @MinLength(2)
  content: string;

  @IsOptional()
  parentId?: string;
}
