import { Tweet } from '../entities/tweet.entity';

export interface ITweetLikeResponse extends Tweet {
  likesCount: number;
  isLiked: boolean;
}
