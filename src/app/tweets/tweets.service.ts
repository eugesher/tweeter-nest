import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tweet } from './entities/tweet.entity';
import { User } from '../users/entities/user.entity';
import { CreateTweetDto } from './dto/create-tweet.dto';

@Injectable()
export class TweetsService {
  constructor(
    @InjectRepository(Tweet)
    private readonly tweetRepository: Repository<Tweet>,
  ) {}

  async create(currentUser: User, dto: CreateTweetDto): Promise<Tweet> {
    const tweet = new Tweet();
    Object.assign(tweet, dto);
    tweet.author = currentUser;
    return await this.tweetRepository.save(tweet);
  }
}
