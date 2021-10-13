import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { TweetsService } from './tweets.service';
import { CreateTweetDto } from './dto/create-tweet.dto';
import { AuthGuard } from '../users/guards/auth.guard';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { Tweet } from './entities/tweet.entity';
import { User } from '../users/entities/user.entity';

@Controller('tweets')
export class TweetsController {
  constructor(private readonly tweetsService: TweetsService) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @CurrentUser() currentUser: User,
    @Body() dto: CreateTweetDto,
  ): Promise<Tweet> {
    return await this.tweetsService.create(currentUser, dto);
  }
}
