import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user) {
      return null;
    }

    // If data is provided (e.g., @GetUser('id')), return specific field
    if (data) {
      return user[data];
    }

    return user;
  },
);