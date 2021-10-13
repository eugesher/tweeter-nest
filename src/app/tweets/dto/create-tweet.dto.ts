import { IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreateTweetDto {
  @IsNotEmpty()
  body: string;

  @IsOptional()
  @IsUrl()
  image: string;
}
