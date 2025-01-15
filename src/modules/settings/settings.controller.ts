import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { SettingsService } from "./settings.service";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { User } from "src/decorators/user.decorator";
import { UserEntity } from "src/users/entities/user.entity";
import { Roles } from "src/decorators/role.decarator";

@Controller("settings")
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @UseGuards(JwtAuthGuard)
  @Roles("ChangePanelSettings")
  @Get("modloginterval")
  async getModlogIntervalSetting(@User() user: UserEntity) {
    return await this.settingsService.getModlogExpireInterval();
  }

  @UseGuards(JwtAuthGuard)
  @Roles("ChangePanelSettings")
  @Post("modloginterval/:days")
  async setModlogintervalSettings(
    @User() user: UserEntity,
    @Param("days") _days: string
  ) {
    try {
      parseInt(_days);
    } catch (error) {
      throw new BadRequestException("Please provide a number.");
    }
    return await this.settingsService.setModlogExpireInterval(_days);
  }
}
