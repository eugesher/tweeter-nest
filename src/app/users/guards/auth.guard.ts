import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ExpressRequestInterface } from '../../../interfaces/express-request.interface';
import { AUTH_REQUIRED } from '../constants/users.constants';

Injectable();
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<ExpressRequestInterface>();

    if (req.user) {
      return true;
    } else {
      throw new UnauthorizedException(AUTH_REQUIRED);
    }
  }
}
