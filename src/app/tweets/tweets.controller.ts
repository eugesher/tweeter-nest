import {
  Controller,
  Post,
  Body,
  UseGuards,
  Query,
  Get,
  Delete,
  Param,
} from '@nestjs/common';
import { TweetsService } from './tweets.service';
import { CreateTweetDto } from './dto/create-tweet.dto';
import { AuthGuard } from '../users/guards/auth.guard';
import { Tweet } from './entities/tweet.entity';
import { User } from '../users/entities/user.entity';
import { FindTweetsQueryInterface } from './types/find-tweets-query.interface';
import { CurrentUser } from '../users/decorators/current-user.decorator';

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

  @Get()
  async findAll(
    @CurrentUser('id') currentUserId: string,
    @Query('') query: FindTweetsQueryInterface,
  ): Promise<Tweet[]> {
    return await this.tweetsService.findAll(currentUserId, query);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(
    @CurrentUser('id') currentUserId: string,
    @Param('id') id: string,
  ) {
    return this.tweetsService.remove(currentUserId, id);
  }
}
