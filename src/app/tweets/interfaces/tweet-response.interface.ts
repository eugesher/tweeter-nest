import { Tweet } from '../entities/tweet.entity';

export interface TweetResponseInterface extends Tweet {
  isRetweeted: boolean;
}
