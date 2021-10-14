import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tweet } from './entities/tweet.entity';
import { User } from '../users/entities/user.entity';
import { TweetsController } from './tweets.controller';
import { TweetsService } from './tweets.service';
import { Retweet } from './entities/retweet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tweet, Retweet, User])],
  controllers: [TweetsController],
  providers: [TweetsService],
})
export class TweetsModule {}
