import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Tweet } from './tweet.entity';

@Entity('tweet_likes')
export class TweetLike {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId: string;

  @PrimaryColumn({ name: 'tweet_id', type: 'uuid' })
  tweetId: string;

  @ManyToOne(() => User, (user) => user.tweetLikes)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Tweet, (tweet) => tweet.likes)
  @JoinColumn({ name: 'tweet_id' })
  tweet: Tweet;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
