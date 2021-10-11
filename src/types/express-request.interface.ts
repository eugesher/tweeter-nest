import { Request } from 'express';
import { User } from '../users/entities/user.entity';

export interface ExpressRequestInterface extends Request {
  user?: User;
}
