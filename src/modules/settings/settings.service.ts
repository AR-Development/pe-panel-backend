import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { SettingsEnums, SettingsValueTypeEnums } from "./settings.enums";
import { DBConnectionFactory } from "src/infrastructure/factories/dbconnection.factory";
import { UserEntity } from "src/users/entities/user.entity";

@Injectable()
export class SettingsService {
  constructor(private prismaService: PrismaService) {}

  async setModlogExpireInterval(days: string) {
    const configName = SettingsEnums.MODLOG_EXPIRE_INTERVAL_DAYS;

    const existingConfig = await this.prismaService.panelconfigs.findUnique({
      where: { ConfigName: configName },
    });

    if (existingConfig) {
      return this.prismaService.panelconfigs.update({
        where: { ConfigName: configName },
        data: { ConfigValue: days },
      });
    } else {
      return this.prismaService.panelconfigs.create({
        data: {
          ConfigName: configName,
          ConfigValue: days,
          ConfigValueType: SettingsValueTypeEnums.STRING,
        },
      });
    }
  }

  async getModlogExpireInterval() {
    const configName = SettingsEnums.MODLOG_EXPIRE_INTERVAL_DAYS;

    const existingConfig = await this.prismaService.panelconfigs.findUnique({
      where: { ConfigName: configName },
    });

    return existingConfig;
  }
}
