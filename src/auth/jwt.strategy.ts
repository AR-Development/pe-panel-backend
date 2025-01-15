import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { UsersService } from "src/users/users.service";
import { TokenPayload } from "./dto/auth.dto";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UsersService
  ) {
    const customExtractor = function (req) {
      let token = null;
      if (req) {
        if (req.header("Authorization")) {
          token = req.header("Authorization").split(" ")[1];
        }
        //query token priotized
        if (req.query["token"]) {
          token = req.query["token"];
        }
      }
      return token;
    };
    super({
      jwtFromRequest: customExtractor,
      ignoreExpiration: true,
      secretOrKey: configService.get("TOKEN_SECRET"),
    });
  }

  async validate(payload: TokenPayload) {
    const userExist = await this.userService.findOne(payload.username);
    if (!userExist) {
      throw new UnauthorizedException();
    }
    return payload;
  }
}
