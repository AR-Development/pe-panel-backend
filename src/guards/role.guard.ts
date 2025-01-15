import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { TokenPayload } from "src/auth/dto/auth.dto";
import { Roles } from "src/decorators/role.decarator";
import { RoleCache } from "src/infrastructure/cache/roles";
import { UserCache } from "src/infrastructure/cache/users";
import { PanelPermissions } from "src/modules/roles/roles.actions";
import { RolesService } from "src/modules/roles/roles.service";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private roleService: RolesService,
    private roleCache: RoleCache,
    private userCache: UserCache
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles: PanelPermissions[] = this.reflector.get(
      Roles,
      context.getHandler()
    );
    const request = context.switchToHttp().getRequest();
    const user = request.user as TokenPayload;
    const cachedRole = await this.roleCache.getRole(user.roleId);
    const cachedUser = await this.userCache.getUser(user.userId.toString());
    if (cachedUser.administrator) {
      return true;
    } else {
      if (cachedRole && cachedRole.permissionBits) {
        return this.roleService.hasPermission(cachedRole.permissionBits, roles);
      }
    }
  }
}
