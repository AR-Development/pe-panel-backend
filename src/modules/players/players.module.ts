import { Module } from "@nestjs/common";
import { PlayersService } from "./players.service";
import { PlayersController } from "./players.controller";
import { GameserverModule } from "../gameserver/gameserver.module";
import { DiscordModule } from "../discord/discord.module";
import { InfrastructureModule } from "src/infrastructure/infrastructure.module";

@Module({
  controllers: [PlayersController],
  providers: [PlayersService],
  imports: [GameserverModule, DiscordModule, InfrastructureModule],
})
export class PlayersModule {}
