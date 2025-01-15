import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { CreateRoleDto, UpdateRoleDto } from "./dto/roles.dto";
import { PanelPermissions, roleActions } from "./roles.actions";
import { actionTypes } from "../logs/logs.actions";
import { UserEntity } from "src/users/entities/user.entity";

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);
  constructor(private readonly prismaService: PrismaService) {}

  public hasPermission(
    permissionPower: number,
    permissionsWillBeChecked: PanelPermissions[]
  ): boolean {
    return permissionsWillBeChecked.every(
      (item) =>
        (permissionPower & roleActions[item].permissionBit) ===
        roleActions[item].permissionBit
    );
  }

  async findAllRoles(page: number, limit: number) {
    const roles = await this.prismaService.$transaction([
      {
        ...this.prismaService.panelroles.findMany({
          skip: page * limit,
          take: limit,
        }),
      },
      this.prismaService.panelroles.count({
        skip: page * limit,
        take: limit,
      }),
    ]);
    roles[0] = roles[0].map((item) => {
      return { ...item, actions: this.permissionMapper(item.PermissionBit) };
    });
    return roles;
  }

  async findOneRole(roleId: number) {
    const role = await this.prismaService.panelroles.findFirst({
      where: { AND: [{ Id: roleId }] },
    });
    const mappedRole = {
      ...role,
      actions: this.permissionMapper(role.PermissionBit),
    };
    return mappedRole;
  }

  async createRole(dto: CreateRoleDto) {
    const permissionBits = this.mergePermissionBits(dto.permissions);
    return await this.prismaService.panelroles.create({
      data: {
        Name: dto.name,
        PermissionBit: permissionBits,
      },
    });
  }

  async editRole(dto: UpdateRoleDto) {
    const permissionBits = this.mergePermissionBits(dto.permissions);
    return await this.prismaService.panelroles.updateMany({
      where: { AND: [{ Id: dto.id }] },
      data: { PermissionBit: permissionBits },
    });
  }

  async deleteRole(roleId: number) {
    return await this.prismaService.panelroles.deleteMany({
      where: { AND: [{ Id: roleId }] },
    });
  }

  permissionMapper(permissionBit: number) {
    return Object.keys(roleActions).filter((item: PanelPermissions) => {
      return this.hasPermission(permissionBit, [item]);
    });
  }

  public async addPermissionToRole(
    roleId: number,
    permissions: PanelPermissions[]
  ): Promise<boolean> {
    try {
      const role = await this.prismaService.panelroles.findFirst({
        where: { Id: roleId },
      });
      let permissionState = role.PermissionBit;
      permissions.forEach((item) => {
        permissionState |= roleActions[item].permissionBit;
      });
      await this.prismaService.panelroles.update({
        where: { Id: roleId },
        data: { PermissionBit: permissionState },
      });
      return true;
    } catch (error) {
      this.logger.error(error, error.stack);
      return false;
    }
  }

  public async removePermissionFromRole(
    roleId: number,
    permissions: PanelPermissions[]
  ): Promise<boolean> {
    try {
      const role = await this.prismaService.panelroles.findFirst({
        where: { Id: roleId },
      });
      let permissionState = role.PermissionBit;
      permissions.forEach((item) => {
        permissionState &= ~roleActions[item].permissionBit;
      });
      await this.prismaService.panelroles.update({
        where: { Id: roleId },
        data: { PermissionBit: permissionState },
      });
      return true;
    } catch (error) {
      this.logger.error(error, error.stack);
      return false;
    }
  }

  /**
   *
   * @param permissions
   * @returns Returns the total permission number of all permissions provided.
   */
  public mergePermissionBits(permissions: PanelPermissions[]) {
    let permissionBit: number = 0;
    permissions.forEach((item) => {
      permissionBit |= roleActions[item].permissionBit;
    });
    return permissionBit;
  }
}
