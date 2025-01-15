import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { TokenPayload } from "src/auth/dto/auth.dto";

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as TokenPayload;
  }
);
