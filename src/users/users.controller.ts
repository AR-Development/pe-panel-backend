import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Delete,
  UseGuards,
  BadRequestException,
  Put,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { User } from "src/decorators/user.decorator";
import { UserEntity } from "./entities/user.entity";
import { UpdateUserDto } from "./dto/update-user.dto";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Post("register")
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get("search")
  async playerSearch(@Query("username") _username: string) {
    return await this.usersService.searchUser(_username);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @Query("page") _page: string,
    @Query("limit") _limit: string,
    @Query("username") _username: string
  ) {
    const page = _page ? parseInt(_page) : 0;
    const limit = _limit ? parseInt(_limit) : 25;
    return this.usersService.findAll(page, limit, _username);
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  async updateRole(
    @Body() updateUserDto: UpdateUserDto,
    @User() user: UserEntity
  ) {
    const roleId = updateUserDto.roleid ? updateUserDto.roleid : null;
    const admin = updateUserDto.admin ? updateUserDto.admin : false;
    if (updateUserDto.username) {
      return await this.usersService.updateRole(
        user,
        roleId,
        admin,
        updateUserDto.username
      );
    } else {
      throw new BadRequestException("Username field is empty.");
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  remove(@Query("username") _username: string) {
    return this.usersService.delete(_username);
  }
}
