import { Injectable } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { users, panelroles } from "@prisma/client";
import { TokenPayload } from "./dto/auth.dto";
import { RolesService } from "src/modules/roles/roles.service";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private roleService: RolesService
  ) {}

  async validateUser(username: string, pass: string) {
    const user = await this.usersService.findOne(username);
    if (user && user.Password === pass) {
      const { Password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(
    user: users & {
      role: panelroles;
    }
  ) {
    const payload: TokenPayload = {
      username: user.Username,
      userId: user.Id,
      createdat: new Date(),
      roleId: user.role.Id,
    };
    return {
      access_token: this.jwtService.sign(payload, {
        secret: this.configService.get("TOKEN_SECRET"),
      }),
      actions:
        user.role && user.role.PermissionBit
          ? this.roleService.permissionMapper(user.role.PermissionBit)
          : user.Administrator
          ? ["Administrator"]
          : [],
    };
  }
}
