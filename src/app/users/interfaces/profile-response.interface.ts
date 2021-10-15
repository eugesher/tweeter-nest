import { IUserResponse } from './user-response.interface';

export interface IProfileResponse
  extends Omit<IUserResponse, 'email' | 'createdAt' | 'updatedAt' | 'token'> {
  isFollowing?: boolean;
}
