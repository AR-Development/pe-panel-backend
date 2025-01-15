import { Injectable } from "@nestjs/common";
import { PrismaService } from "../infrastructure/prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserEntity } from "./entities/user.entity";

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async findOne(username: string) {
    return this.prismaService.users.findFirst({
      where: { Username: username },
      include: { role: true },
    });
  }

  // page start index is 0
  async findAll(page: number, limit: number, username = "") {
    return await this.prismaService.$transaction([
      this.prismaService.users.findMany({
        skip: page * limit,
        take: limit,
        where: {
          AND: [{ Username: { contains: username } }],
        },
        select: {
          role: { select: { Id: true, Name: true } },
          Administrator: true,
          Id: true,
          panelrolesId: true,
          Username: true,
          CreatedAt: true,
        },
      }),
      this.prismaService.users.count({
        where: {
          AND: [{ Username: { contains: username } }],
        },
      }),
    ]);
  }

  async searchUser(userName: string) {
    const result = await this.prismaService.users.findMany({
      where: {
        AND: [{ Username: { contains: userName } }],
      },
      take: 10,
    });
    return result;
  }

  async updateRole(
    user: UserEntity,
    roleId: number | null,
    admin: boolean | null,
    username: string
  ) {
    return await this.prismaService.users.updateMany({
      where: {
        AND: [{ Username: username }],
      },
      data: {
        panelrolesId: roleId,
        Administrator: admin ? admin : false,
      },
    });
  }

  async create(user: CreateUserDto) {
    return await this.prismaService.users.create({
      data: {
        Username: user.username,
        Password: user.password,
        ...(user.roleid && {
          role: {
            connect: {
              Id: user.roleid,
            },
          },
        }),
        Administrator: user.admin ? user.admin : undefined,
      },
    });
  }

  async delete(username: string) {
    return await this.prismaService.users.deleteMany({
      where: { AND: [{ Username: username }] },
    });
  }
}
