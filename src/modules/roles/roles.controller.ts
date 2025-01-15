import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { RolesService } from "./roles.service";
import { CreateRoleDto, UpdateRoleDto } from "./dto/roles.dto";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { roleActions } from "./roles.actions";
import { title } from "process";

@Controller("roles")
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async readRoles(
    @Query("page") _page: string,
    @Query("limit") _limit: string
  ) {
    const page = _page ? parseInt(_page) : 0;
    const limit = _limit ? parseInt(_limit) : 25;
    return await this.rolesService.findAllRoles(page, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Get("info")
  async findOne(@Query("roleId", ParseIntPipe) roleId: number) {
    return await this.rolesService.findOneRole(roleId);
  }

  // @UseGuards(JwtAuthGuard)
  @Get("actions")
  async getRoleActions() {
    return Object.keys(roleActions).map((key) => {
      return {
        action: key,
        permissionBit: roleActions[key].permissionBit,
        title: roleActions[key].title,
        desc: roleActions[key].desc,
        id: roleActions[key].id,
      };
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createRole(@Body() dto: CreateRoleDto) {
    return await this.rolesService.createRole(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  async updateRole(@Body() dto: UpdateRoleDto) {
    return await this.rolesService.editRole(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  async removeRole(@Query("roleId", ParseIntPipe) roleId: number) {
    return await this.rolesService.deleteRole(roleId);
  }
}
