import { Tweet } from '../entities/tweet.entity';

export interface IRetweetResponse extends Tweet {
  retweetsCount: number;
  isRetweeted: boolean;
}
