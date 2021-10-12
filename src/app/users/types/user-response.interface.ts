import { UserType } from './user.type';

export interface UserResponseInterface extends Omit<UserType, 'password'> {
  token?: string;
}
