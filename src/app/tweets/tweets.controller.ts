import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DeleteResult } from 'typeorm';
import { TweetsService } from './tweets.service';
import { CreateTweetDto } from './dto/create-tweet.dto';
import { AuthGuard } from '../users/guards/auth.guard';
import { Tweet } from './entities/tweet.entity';
import { User } from '../users/entities/user.entity';
import { IFindTweetsQuery } from './interfaces/find-tweets-query.interface';
import { ITweetResponse } from './interfaces/tweet-response.interface';
import { ITweetLikeResponse } from './interfaces/tweet-like-response.interface';
import { IRetweetResponse } from './interfaces/retweet-response.interface';
import { CurrentUser } from '../users/decorators/current-user.decorator';

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
    const tweets = await this.tweetsService.findAll(query, currentUser);
    return this.tweetsService.buildTweetsResponse(tweets, currentUser);
  }

  @Get(':username')
  @UseGuards(AuthGuard)
  async findByAuthor(
    @Param('username') username: string,
    @Query('') query: IFindTweetsQuery,
    @CurrentUser() currentUser: User,
  ): Promise<Tweet[]> {
    const tweets = await this.tweetsService.findByAuthor(
      username,
      query,
      currentUser,
    );
    return this.tweetsService.buildTweetsResponse(tweets, currentUser);
  }

  @Get(':username/with_retweets')
  @UseGuards(AuthGuard)
  async findByAuthorWithRetweets(
    @Param('username') username: string,
    @Query('') query: IFindTweetsQuery,
    @CurrentUser() currentUser: User,
  ): Promise<Tweet[]> {
    const tweets = await this.tweetsService.findByAuthor(
      username,
      query,
      currentUser,
      { withRetweets: true },
    );
    return this.tweetsService.buildTweetsResponse(tweets, currentUser);
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
    return this.tweetsService.buildTweetsResponse(tweets, currentUser);
  }

  @Get(':username/likes')
  @UseGuards(AuthGuard)
  async findLikedByUser(
    @Param('username') username: string,
    @Query('') query: IFindTweetsQuery,
    @CurrentUser() currentUser: User,
  ): Promise<Tweet[]> {
    const tweets = await this.tweetsService.findLikedByUser(
      username,
      query,
      currentUser,
    );
    return this.tweetsService.buildTweetsResponse(tweets, currentUser);
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
  ): Promise<IRetweetResponse> {
    const tweet = await this.tweetsService.createRetweet(id, currentUser);
    delete tweet.retweets;
    delete tweet.likes;
    return tweet;
  }

  @Delete(':id/retweet')
  @UseGuards(AuthGuard)
  async removeRetweet(
    @Param('id') id: string,
    @CurrentUser() currentUser: User,
  ): Promise<IRetweetResponse> {
    const tweet = await this.tweetsService.removeRetweet(id, currentUser);
    delete tweet.retweets;
    delete tweet.likes;
    return tweet;
  }

  @Post(':id/like')
  @UseGuards(AuthGuard)
  async like(
    @Param('id') id: string,
    @CurrentUser() currentUser: User,
  ): Promise<ITweetLikeResponse> {
    const tweet = await this.tweetsService.like(id, currentUser);
    delete tweet.retweets;
    delete tweet.likes;
    return tweet;
  }

  @Delete(':id/like')
  @UseGuards(AuthGuard)
  async unlike(
    @Param('id') id: string,
    @CurrentUser() currentUser: User,
  ): Promise<ITweetLikeResponse> {
    const tweet = await this.tweetsService.unlike(id, currentUser);
    delete tweet.retweets;
    delete tweet.likes;
    return tweet;
  }
}
