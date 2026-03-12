import { Request } from 'express';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ValidatedUser } from 'src/auth/Strategy/jwt.strategy';

interface RequestWithUser extends Request {
  user: ValidatedUser;
}

export const CurrentUser = createParamDecorator(
  (data: keyof ValidatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();

    if (!request.user) return null;

    return data ? request.user[data] : request.user;
  },
);
