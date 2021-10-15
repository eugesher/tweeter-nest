import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { JwtPayload, verify } from 'jsonwebtoken';
import { UsersService } from '../users.service';
import { ExpressRequestInterface } from '../../../interfaces/express-request.interface';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly usersService: UsersService) {}

  async use(req: ExpressRequestInterface, res: Response, next: NextFunction) {
    const { authorization } = req.headers;

    if (!authorization) {
      req.user = null;
      next();
    } else {
      try {
        const jwtPayload = verify(
          authorization.split(' ')[1],
          process.env.JWT_SECRET,
        ) as JwtPayload;
        req.user = await this.usersService.findOne(jwtPayload.id);
        next();
      } catch (err) {
        req.user = null;
        next();
      }
    }
  }
}
