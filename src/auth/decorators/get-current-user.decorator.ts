import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { AccessTokenPayload } from '../interfaces/token-payload.interface';

export const GetCurrentUser = createParamDecorator(
  (data: keyof AccessTokenPayload | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user = request.user as AccessTokenPayload;
    return data ? user[data] : user;
  },
);
