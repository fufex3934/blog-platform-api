import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(120)
  title: string;

  @IsString()
  @MinLength(20)
  content: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
