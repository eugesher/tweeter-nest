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
import { DeleteResult } from 'typeorm';
import { TweetsService } from './tweets.service';
import { CreateTweetDto } from './dto/create-tweet.dto';
import { AuthGuard } from '../users/guards/auth.guard';
import { Tweet } from './entities/tweet.entity';
import { User } from '../users/entities/user.entity';
import { IFindTweetsQuery } from './interfaces/find-tweets-query.interface';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { ITweetResponse } from './interfaces/tweet-response.interface';

@Controller('tweets')
export class TweetsController {
  constructor(private readonly tweetsService: TweetsService) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Body() dto: CreateTweetDto,
    @CurrentUser() currentUser: User,
  ): Promise<ITweetResponse> {
    return await this.tweetsService.create(dto, currentUser);
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll(
    @Query('') query: IFindTweetsQuery,
    @CurrentUser() currentUser: User,
  ): Promise<Tweet[]> {
    let tweets = await this.tweetsService.findAll(query, currentUser);
    tweets = this.tweetsService.setIsRetweeted(tweets, currentUser);
    tweets.forEach((tweet) => delete tweet.retweets);
    return tweets;
  }

  @Get(':username')
  @UseGuards(AuthGuard)
  async findByAuthor(
    @Param('username') username: string,
    @Query('') query: IFindTweetsQuery,
    @CurrentUser() currentUser: User,
  ): Promise<Tweet[]> {
    let tweets = await this.tweetsService.findByAuthor(
      username,
      query,
      currentUser,
    );
    tweets = this.tweetsService.setIsRetweeted(tweets, currentUser);
    tweets.forEach((tweet) => delete tweet.retweets);
    return tweets;
  }

  @Get(':username/with_retweets')
  @UseGuards(AuthGuard)
  async findByAuthorWithRetweets(
    @Param('username') username: string,
    @Query('') query: IFindTweetsQuery,
    @CurrentUser() currentUser: User,
  ): Promise<Tweet[]> {
    let tweets = await this.tweetsService.findByAuthor(
      username,
      query,
      currentUser,
      { withRetweets: true },
    );
    tweets = this.tweetsService.setIsRetweeted(tweets, currentUser);
    tweets.forEach((tweet) => delete tweet.retweets);
    return tweets;
  }

  @Get(':username/media')
  @UseGuards(AuthGuard)
  async findByAuthorWithMedia(
    @Param('username') username: string,
    @Query('') query: IFindTweetsQuery,
    @CurrentUser() currentUser: User,
  ): Promise<Tweet[]> {
    let tweets = await this.tweetsService.findByAuthor(
      username,
      query,
      currentUser,
    );
    tweets = tweets.filter((tweet) => tweet.image);
    tweets = this.tweetsService.setIsRetweeted(tweets, currentUser);
    tweets.forEach((tweet) => delete tweet.retweets);
    return tweets;
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') currentUserId: string,
  ): Promise<DeleteResult> {
    return this.tweetsService.remove(id, currentUserId);
  }

  @Post(':id/retweet')
  @UseGuards(AuthGuard)
  async createRetweet(
    @Param('id') id: string,
    @CurrentUser() currentUser: User,
  ): Promise<ITweetResponse> {
    return await this.tweetsService.createRetweet(id, currentUser);
  }

  @Delete(':id/retweet')
  @UseGuards(AuthGuard)
  async removeRetweet(
    @Param('id') id: string,
    @CurrentUser() currentUser: User,
  ): Promise<ITweetResponse> {
    return await this.tweetsService.removeRetweet(id, currentUser);
  }
}
