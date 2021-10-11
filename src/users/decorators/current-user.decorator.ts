import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ExpressRequestInterface } from '../../types/express-request.interface';

export const CurrentUser = createParamDecorator(
  (data: any, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest<ExpressRequestInterface>();

    if (!req.user) {
      return null;
    } else if (data) {
      return req.user[data];
    } else {
      return req.user;
    }
  },
);
