import { Request } from 'express';
import { User } from '../app/users/entities/user.entity';

export interface ExpressRequestInterface extends Request {
  user?: User;
}
