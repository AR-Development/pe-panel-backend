import { Module } from "@nestjs/common";
import { ToolsService } from "./tools.service";
import { ToolsController } from "./tools.controller";
import { GameserverModule } from "../gameserver/gameserver.module";
import { ThrottlerModule } from "@nestjs/throttler";
import { HttpModule } from "@nestjs/axios";

@Module({
  imports: [GameserverModule, ThrottlerModule],
  providers: [ToolsService],
  controllers: [ToolsController],
})
export class ToolsModule {}
