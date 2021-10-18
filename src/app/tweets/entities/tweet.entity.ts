import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Retweet } from './retweet.entity';
import { TweetLike } from './tweet-like.entity';

@Entity('tweets')
export class Tweet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  body: string;

  @Column({ nullable: true })
  image: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Retweet, (retweet) => retweet.tweet)
  retweets: Retweet[];

  @OneToMany(() => TweetLike, (tweetLike) => tweetLike.tweet)
  likes: TweetLike[];

  @ManyToOne(() => User, (user) => user.tweets, { eager: true })
  @JoinColumn({ name: 'author_id' })
  author: User;
}
