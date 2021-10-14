import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Retweet } from './retweet.entity';

@Entity('tweets')
export class Tweet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  body: string;

  @Column({ nullable: true })
  image: string;

  @Column({ name: 'retweets_count', default: 0 })
  retweetsCount: number;

  @OneToMany(() => Retweet, (retweet) => retweet.user)
  retweets: Retweet[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.tweets, { eager: true })
  @JoinColumn({ name: 'author_id' })
  author: User;
}
