import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, getRepository, Repository } from 'typeorm';
import { Tweet } from './entities/tweet.entity';
import { User } from '../users/entities/user.entity';
import { CreateTweetDto } from './dto/create-tweet.dto';
import { FindTweetsQueryInterface } from './types/find-tweets-query.interface';
import { DELETE_FORBIDDEN, NOT_FOUND } from './constants/tweets.constants';

@Injectable()
export class TweetsService {
  constructor(
    @InjectRepository(Tweet)
    private readonly tweetRepository: Repository<Tweet>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreateTweetDto, currentUser: User): Promise<Tweet> {
    const tweet = new Tweet();
    Object.assign(tweet, dto);
    tweet.author = currentUser;
    return await this.tweetRepository.save(tweet);
  }

  async findAll(query: FindTweetsQueryInterface): Promise<Tweet[]> {
    const queryBuilder = getRepository(Tweet)
      .createQueryBuilder('tweets')
      .leftJoin('tweets.author', 'author')
      .addSelect([
        'author.id',
        'author.username',
        'author.firstName',
        'author.lastName',
        'author.image',
      ])
      .orderBy('tweets.createdAt', 'DESC');

    if (query.author) {
      const author = await this.userRepository.findOne({
        username: query.author,
      });
      queryBuilder.andWhere('tweets.author_id = :id', { id: author.id });
    }

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    return await queryBuilder.getMany();
  }

  async remove(id: string, currentUserId: string): Promise<DeleteResult> {
    const tweet = await this.tweetRepository.findOne(id);
    if (!tweet) {
      throw new NotFoundException(NOT_FOUND);
    } else if (tweet.author.id !== currentUserId) {
      throw new ForbiddenException(DELETE_FORBIDDEN);
    } else {
      return await this.tweetRepository.delete(id);
    }
  }
}
