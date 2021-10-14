import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeleteResult,
  getRepository,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { Tweet } from './entities/tweet.entity';
import { Retweet } from './entities/retweet.entity';
import { User } from '../users/entities/user.entity';
import { CreateTweetDto } from './dto/create-tweet.dto';
import { IFindTweetsQuery } from './interfaces/find-tweets-query.interface';
import {
  DELETE_FORBIDDEN,
  NOT_FOUND,
  OWN_TWEET,
} from './constants/tweets.constants';
import { TweetResponseInterface } from './interfaces/tweet-response.interface';

@Injectable()
export class TweetsService {
  constructor(
    @InjectRepository(Tweet)
    private readonly tweetRepository: Repository<Tweet>,
    @InjectRepository(Retweet)
    private readonly retweetRepository: Repository<Retweet>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private static handleQuery(
    query: IFindTweetsQuery,
    queryBuilder: SelectQueryBuilder<Tweet>,
  ): void {
    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }
  }

  private async findOne(id: string): Promise<Tweet> {
    const tweet = await this.tweetRepository.findOne(id);
    if (!tweet) {
      throw new NotFoundException(NOT_FOUND);
    } else {
      return tweet;
    }
  }

  async create(dto: CreateTweetDto, currentUser: User): Promise<Tweet> {
    const tweet = new Tweet();
    Object.assign(tweet, dto);
    tweet.author = currentUser;
    return await this.tweetRepository.save(tweet);
  }

  async findAll(query: IFindTweetsQuery): Promise<Tweet[]> {
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

    TweetsService.handleQuery(query, queryBuilder);

    return await queryBuilder.getMany();
  }

  async findByAuthor(
    username: string,
    query: IFindTweetsQuery,
    currentUser: User,
  ): Promise<Tweet[]> {
    const author =
      username === currentUser.username
        ? currentUser
        : await this.userRepository.findOne({ username });
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
      .andWhere('tweets.author_id = :id', { id: author.id })
      .orderBy('tweets.createdAt', 'DESC');

    TweetsService.handleQuery(query, queryBuilder);

    return await queryBuilder.getMany();
  }

  async remove(id: string, currentUserId: string): Promise<DeleteResult> {
    const tweet = await this.findOne(id);
    if (tweet.author.id !== currentUserId) {
      throw new ForbiddenException(DELETE_FORBIDDEN);
    } else {
      return await this.tweetRepository.delete(id);
    }
  }

  async createRetweet(
    id: string,
    currentUser: User,
  ): Promise<TweetResponseInterface> {
    if (await this.tweetRepository.findOne({ id, author: currentUser })) {
      throw new BadRequestException(OWN_TWEET);
    }

    const tweet = await this.findOne(id);
    let retweet = await this.retweetRepository.findOne({
      user: currentUser,
      tweet: tweet,
    });

    if (!retweet) {
      retweet = new Retweet();
      retweet.user = currentUser;
      retweet.tweet = tweet;
      tweet.retweetsCount++;
      await this.retweetRepository.save(retweet);
      await this.tweetRepository.save(tweet);
    }

    return { ...tweet, isRetweeted: true };
  }

  async removeRetweet(
    id: string,
    currentUser: User,
  ): Promise<TweetResponseInterface> {
    if (await this.tweetRepository.findOne({ id, author: currentUser })) {
      throw new BadRequestException(OWN_TWEET);
    }

    const tweet = await this.findOne(id);
    tweet.retweetsCount--;

    await this.retweetRepository.delete({
      user: currentUser,
      tweet: tweet,
    });
    await this.tweetRepository.save(tweet);

    return { ...tweet, isRetweeted: false };
  }
}
