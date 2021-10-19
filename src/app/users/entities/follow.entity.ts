import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('follows')
export class Follow {
  @PrimaryColumn({ name: 'follower_id', type: 'uuid' })
  followerId: string;

  @PrimaryColumn({ name: 'following_id', type: 'uuid' })
  followingId: string;

  @ManyToOne(() => User, (user) => user.followers)
  @JoinColumn({ name: 'follower_id' })
  follower: User;

  @ManyToOne(() => User, (user) => user.followings)
  @JoinColumn({ name: 'following_id' })
  following: User;
}
