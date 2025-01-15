import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ToolsService } from "./tools.service";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { GameServerAnnouncementDto } from "../gameserver/dto/gameserver.dto";
import { GameserverService } from "../gameserver/gameserver.service";
import { User } from "src/decorators/user.decorator";
import { UserEntity } from "../../users/entities/user.entity";
import { Throttle } from "@nestjs/throttler";
import { Roles } from "src/decorators/role.decarator";

@Controller("tools")
export class ToolsController {
  constructor(
    private toolsService: ToolsService,
    private gameserverService: GameserverService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Throttle(5, 10)
  @Get("compcalculator")
  compenationCalculate(@Query("droppedItems") droppedItems: string) {
    if (!droppedItems || droppedItems.length === 0) {
      throw new BadRequestException(
        "You must provide dropped items with valid format."
      );
    }
    return this.toolsService.compensateCalculator(droppedItems);
  }

  @UseGuards(JwtAuthGuard)
  @Roles("Announcement")
  @Throttle(1, 15)
  @Post("announcement")
  async makeAnnouncement(
    @User() user: UserEntity,
    @Body() dto: Pick<GameServerAnnouncementDto, "Message">
  ) {
    if (!dto.Message || dto.Message.length === 0) {
      throw new BadRequestException(
        "You must provide sender and message with valid format."
      );
    }
    await this.gameserverService.makeAnnouncementInGame({
      Sender: user.username,
      Message: dto.Message,
    });
    return { status: "OK" };
  }
}
