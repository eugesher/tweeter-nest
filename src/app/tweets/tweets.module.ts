import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tweet } from './entities/tweet.entity';
import { Retweet } from './entities/retweet.entity';
import { TweetLike } from './entities/tweet-like.entity';
import { User } from '../users/entities/user.entity';
import { TweetsController } from './tweets.controller';
import { TweetsService } from './tweets.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tweet, Retweet, TweetLike, User])],
  controllers: [TweetsController],
  providers: [TweetsService],
})
export class TweetsModule {}
