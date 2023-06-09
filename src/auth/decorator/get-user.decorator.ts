import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { User } from 'src/user/entity/user.entity';

export const GetUser = createParamDecorator(
  (data, ctx: ExecutionContext): User => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
  },
);
