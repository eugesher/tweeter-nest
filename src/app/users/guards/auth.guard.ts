import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ExpressRequestInterface } from '../../../types/express-request.interface';

Injectable();
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<ExpressRequestInterface>();

    if (req.user) {
      return true;
    } else {
      throw new UnauthorizedException('authorization required');
    }
  }
}
