import { User } from '../entities/user.entity';

export interface IUserResponse extends Omit<User, 'password' | 'hashPassword'> {
  token: string;
}
