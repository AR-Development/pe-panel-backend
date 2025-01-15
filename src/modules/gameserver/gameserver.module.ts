import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { GameserverService } from "./gameserver.service";
import { InfrastructureModule } from "src/infrastructure/infrastructure.module";

@Module({
  providers: [GameserverService],
  imports: [
    HttpModule.register({
      baseURL: process.env.GAME_WEBAPI_URL,
      headers: { Authorization: process.env.GAME_WEBAPI_TOKEN },
    }),
    InfrastructureModule,
  ],
  exports: [GameserverService],
})
export class GameserverModule {}
