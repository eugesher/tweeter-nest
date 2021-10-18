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
import { TweetLike } from './entities/tweet-like.entity';
import { User } from '../users/entities/user.entity';
import { CreateTweetDto } from './dto/create-tweet.dto';
import { IFindTweetsQuery } from './interfaces/find-tweets-query.interface';
import { ITweetResponse } from './interfaces/tweet-response.interface';
import { IRetweetResponse } from './interfaces/retweet-response.interface';
import { ITweetLikeResponse } from './interfaces/tweet-like-response.interface';
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
    @InjectRepository(TweetLike)
    private readonly tweetLikeRepository: Repository<TweetLike>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private static getQueryBuilder(
    query: IFindTweetsQuery,
  ): SelectQueryBuilder<Tweet> {
    const queryBuilder = getRepository(Tweet)
      .createQueryBuilder('tweets')
      .loadRelationCountAndMap('tweets.retweetsCount', 'tweets.retweets')
      .loadRelationCountAndMap('tweets.likesCount', 'tweets.likes')
      .leftJoin('tweets.retweets', 'retweets')
      .addSelect('retweets.userId')
      .leftJoin('tweets.likes', 'likes')
      .addSelect('likes.userId')
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

  private static compare(a: Tweet, b: Tweet): number {
    if (a.createdAt < b.createdAt) {
      return 1;
    } else if (a.createdAt > b.createdAt) {
      return -1;
    } else {
      return 0;
    }
  }

  private setCreateDate(
    retweetedTweets: Tweet[],
    retweets: Retweet[],
  ): Tweet[] {
    return retweetedTweets.map((rt) => {
      const foundRt = retweets.find((r) => r.tweetId === rt.id);
      const createdAt = foundRt && foundRt.createdAt;
      if (createdAt) {
        return { ...rt, createdAt };
      } else {
        return rt;
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
    retweetedTweets = this.setCreateDate(retweetedTweets, retweets);

    tweets.push(...retweetedTweets);
    tweets.sort(TweetsService.compare);

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

  setIsRetweeted(
    tweets: Tweet[],
    currentUser: User,
  ): (Tweet & { isRetweeted: boolean })[] {
    return tweets.map((tweet) => {
      if (tweet.retweets.some((retweet) => retweet.userId === currentUser.id)) {
        return { ...tweet, isRetweeted: true };
      } else {
        return { ...tweet, isRetweeted: false };
      }
    });
  }

  setIsLiked(
    tweets: Tweet[],
    currentUser: User,
  ): (Tweet & { isLiked: boolean })[] {
    return tweets.map((tweet) => {
      if (tweet.likes.some((like) => like.userId === currentUser.id)) {
        return { ...tweet, isLiked: true };
      } else {
        return { ...tweet, isLiked: false };
      }
    });
  }

  buildTweetsResponse(tweets: Tweet[], currentUser: User): Tweet[] {
    tweets = this.setIsRetweeted(tweets, currentUser);
    tweets = this.setIsLiked(tweets, currentUser);
    tweets.forEach((tweet) => {
      delete tweet.retweets;
      delete tweet.likes;
    });
    return tweets;
  }

  async create(
    dto: CreateTweetDto,
    currentUser: User,
  ): Promise<ITweetResponse> {
    const tweet = new Tweet() as ITweetResponse;
    Object.assign(tweet, dto);
    tweet.author = currentUser;
    tweet.likesCount = 0;
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

  async findLikedByUser(
    username: string,
    query: IFindTweetsQuery,
    currentUser: User,
  ): Promise<Tweet[]> {
    const user =
      username === currentUser.username
        ? currentUser
        : await this.userRepository.findOne({ username });
    const likes = await this.tweetLikeRepository.find({ user });

    if (!likes.length) {
      return [];
    }

    const likedTweetsIds = likes.map((like) => like.tweetId);

    const queryBuilder = TweetsService.getQueryBuilder(query).where(
      'tweets.id IN (:...likedTweetsIds)',
      { likedTweetsIds },
    );

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
  ): Promise<IRetweetResponse> {
    if (await this.tweetRepository.findOne({ id, author: currentUser })) {
      throw new BadRequestException(OWN_TWEET);
    }

    const tweet = await this.findOne(id, { relations: ['retweets'] });

    let retweet = await this.retweetRepository.findOne({
      user: currentUser,
      tweet: tweet,
    });
    let retweetsCount = tweet.retweets.length;

    if (!retweet) {
      retweet = new Retweet();
      retweet.user = currentUser;
      retweet.tweet = tweet;
      retweetsCount++;
      await this.tweetRepository.save(tweet);
      await this.retweetRepository.save(retweet);
    }

    return {
      ...tweet,
      retweetsCount,
      isRetweeted: true,
    };
  }

  async removeRetweet(
    id: string,
    currentUser: User,
  ): Promise<IRetweetResponse> {
    if (await this.tweetRepository.findOne({ id, author: currentUser })) {
      throw new BadRequestException(OWN_TWEET);
    }

    const tweet = await this.findOne(id, { relations: ['retweets'] });
    const retweetsCount = tweet.retweets.length - 1;

    await this.retweetRepository.delete({
      user: currentUser,
      tweet: tweet,
    });
    await this.tweetRepository.save(tweet);

    return {
      ...tweet,
      retweetsCount,
      isRetweeted: false,
    };
  }

  async like(id: string, currentUser: User): Promise<ITweetLikeResponse> {
    if (await this.tweetRepository.findOne({ id, author: currentUser })) {
      throw new BadRequestException(OWN_TWEET);
    }

    const tweet = await this.findOne(id, { relations: ['likes'] });

    let like = await this.tweetLikeRepository.findOne({
      user: currentUser,
      tweet: tweet,
    });
    let likesCount = tweet.likes.length;

    if (!like) {
      like = new TweetLike();
      like.user = currentUser;
      like.tweet = tweet;
      likesCount++;
      await this.tweetRepository.save(tweet);
      await this.tweetLikeRepository.save(like);
    }

    return {
      ...tweet,
      likesCount,
      isLiked: true,
    };
  }

  async unlike(id: string, currentUser: User): Promise<ITweetLikeResponse> {
    if (await this.tweetRepository.findOne({ id, author: currentUser })) {
      throw new BadRequestException(OWN_TWEET);
    }

    const tweet = await this.findOne(id, { relations: ['likes'] });
    const likesCount = tweet.likes.length - 1;

    await this.tweetLikeRepository.delete({
      user: currentUser,
      tweet: tweet,
    });
    await this.tweetRepository.save(tweet);

    return {
      ...tweet,
      likesCount,
      isLiked: false,
    };
  }
}
