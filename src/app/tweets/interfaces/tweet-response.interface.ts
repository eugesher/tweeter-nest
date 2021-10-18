import { Tweet } from '../entities/tweet.entity';

export interface ITweetResponse extends Tweet {
  retweetsCount?: number;
  likesCount?: number;
  isRetweeted?: boolean;
  isLiked?: boolean;
}
