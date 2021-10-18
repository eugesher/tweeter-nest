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
import { FindOneOptions } from 'typeorm/find-options/FindOneOptions';
import { Tweet } from './entities/tweet.entity';
import { Retweet } from './entities/retweet.entity';
import { User } from '../users/entities/user.entity';
import { CreateTweetDto } from './dto/create-tweet.dto';
import { ITweetResponse } from './interfaces/tweet-response.interface';
import { IFindTweetsQuery } from './interfaces/find-tweets-query.interface';
import {
  DELETE_FORBIDDEN,
  NOT_FOUND,
  OWN_TWEET,
} from './constants/tweets.constants';

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

  private static getQueryBuilder(
    query: IFindTweetsQuery,
  ): SelectQueryBuilder<Tweet> {
    const queryBuilder = getRepository(Tweet)
      .createQueryBuilder('tweets')
      .loadRelationCountAndMap('tweets.retweetsCount', 'tweets.retweets')
      .leftJoin('tweets.retweets', 'retweets')
      .addSelect('retweets.userId')
      .leftJoin('tweets.author', 'author')
      .addSelect([
        'author.id',
        'author.username',
        'author.firstName',
        'author.lastName',
        'author.image',
      ])
      .orderBy('tweets.createdAt', 'DESC');

    if (query.limit) {
      queryBuilder.take(query.limit);
    }

    if (query.offset) {
      queryBuilder.skip(query.offset);
    }

    return queryBuilder;
  }

  setIsRetweeted(tweets: Tweet[], currentUser: User): Tweet[] {
    return tweets.map((tweet) => {
      if (tweet.retweets.some((retweet) => retweet.userId === currentUser.id)) {
        return { ...tweet, isRetweeted: true };
      } else {
        return { ...tweet, isRetweeted: false };
      }
    });
  }

  private async setRetweets(
    tweets: Tweet[],
    user: User,
    queryBuilder: SelectQueryBuilder<Tweet>,
  ): Promise<Tweet[]> {
    const retweets = await this.retweetRepository.find({ user });

    if (!retweets.length) {
      return [];
    }

    const retweetedTweetsIds = retweets.map((retweet) => retweet.tweetId);

    queryBuilder.where('tweets.id IN (:...retweetedTweetsIds)', {
      retweetedTweetsIds,
    });

    let retweetedTweets = await queryBuilder.getMany();
    retweetedTweets = retweetedTweets.map((rt) => {
      const foundRt = retweets.find((r) => r.tweetId === rt.id);
      const createdAt = foundRt && foundRt.createdAt;
      if (createdAt) {
        return { ...rt, createdAt };
      } else {
        return rt;
      }
    });

    tweets.push(...retweetedTweets);
    tweets.sort((a, b) => {
      if (a.createdAt < b.createdAt) {
        return 1;
      } else if (a.createdAt > b.createdAt) {
        return -1;
      } else {
        return 0;
      }
    });

    return tweets;
  }

  private async findOne(
    id: string,
    options?: FindOneOptions<Tweet>,
  ): Promise<Tweet> {
    const tweet = await this.tweetRepository.findOne(id, options);
    if (!tweet) {
      throw new NotFoundException(NOT_FOUND);
    } else {
      return tweet;
    }
  }

  async create(
    dto: CreateTweetDto,
    currentUser: User,
  ): Promise<ITweetResponse> {
    const tweet = new Tweet() as ITweetResponse;
    Object.assign(tweet, dto);
    tweet.author = currentUser;
    tweet.retweetsCount = 0;
    return await this.tweetRepository.save(tweet);
  }

  async findAll(query: IFindTweetsQuery, currentUser: User): Promise<Tweet[]> {
    const queryBuilder = TweetsService.getQueryBuilder(query);
    let tweets = await queryBuilder.getMany();
    tweets = this.setIsRetweeted(tweets, currentUser);
    return tweets;
  }

  async findByAuthor(
    username: string,
    query: IFindTweetsQuery,
    currentUser: User,
    options = { withRetweets: false },
  ): Promise<Tweet[]> {
    const author =
      username === currentUser.username
        ? currentUser
        : await this.userRepository.findOne({ username });
    const queryBuilder = TweetsService.getQueryBuilder(query).where(
      'tweets.author_id = :id',
      { id: author.id },
    );

    let tweets = await queryBuilder.getMany();

    if (options.withRetweets) {
      tweets = await this.setRetweets(tweets, author, queryBuilder);
    }

    return tweets;
  }

  async remove(id: string, currentUserId: string): Promise<DeleteResult> {
    const tweet = await this.findOne(id);
    if (tweet.author.id !== currentUserId) {
      throw new ForbiddenException(DELETE_FORBIDDEN);
    } else {
      return await this.tweetRepository.delete(id);
    }
  }

  async createRetweet(id: string, currentUser: User): Promise<ITweetResponse> {
    if (await this.tweetRepository.findOne({ id, author: currentUser })) {
      throw new BadRequestException(OWN_TWEET);
    }

    const tweet = await this.findOne(id, { relations: ['retweets'] });
    let retweet = await this.retweetRepository.findOne({
      user: currentUser,
      tweet: tweet,
    });

    if (!retweet) {
      retweet = new Retweet();
      retweet.user = currentUser;
      retweet.tweet = tweet;
      await this.tweetRepository.save(tweet);
      await this.retweetRepository.save(retweet);
    }

    return {
      ...tweet,
      retweetsCount: tweet.retweets.length,
      isRetweeted: true,
    };
  }

  async removeRetweet(id: string, currentUser: User): Promise<ITweetResponse> {
    if (await this.tweetRepository.findOne({ id, author: currentUser })) {
      throw new BadRequestException(OWN_TWEET);
    }

    const tweet = await this.findOne(id, { relations: ['retweets'] });

    await this.retweetRepository.delete({
      user: currentUser,
      tweet: tweet,
    });
    await this.tweetRepository.save(tweet);

    return {
      ...tweet,
      retweetsCount: tweet.retweets.length,
      isRetweeted: false,
    };
  }
}
