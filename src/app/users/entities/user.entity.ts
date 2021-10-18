import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { hash } from 'bcrypt';
import { Tweet } from '../../tweets/entities/tweet.entity';
import { Retweet } from '../../tweets/entities/retweet.entity';
import { TweetLike } from '../../tweets/entities/tweet-like.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ select: false })
  password: string;

  @Column({ default: '' })
  bio: string;

  @Column({ default: '' })
  image: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Tweet, (tweet) => tweet.author)
  tweets: Tweet[];

  @OneToMany(() => Retweet, (retweet) => retweet.user)
  retweets: Retweet[];

  @OneToMany(() => TweetLike, (tweetLike) => tweetLike.user)
  tweetLikes: TweetLike[];

  @BeforeInsert()
  async hashPassword(): Promise<void> {
    this.password = await hash(
      this.password,
      parseInt(process.env.PASSWORD_SALT_ROUNDS),
    );
  }
}
