import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { PrismaModule } from "./infrastructure/prisma/prisma.module";
import { PlayersModule } from "./modules/players/players.module";
import { ConfigModule } from "@nestjs/config";
import { LoggerService } from "./modules/logger/logger.service";
import { LoggerModule } from "./modules/logger/logger.module";
import { LogsModule } from "./modules/logs/logs.module";
import { GameserverModule } from "./modules/gameserver/gameserver.module";
import { ToolsModule } from "./modules/tools/tools.module";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { SettingsModule } from "./modules/settings/settings.module";
import { DiscordModule } from "./modules/discord/discord.module";
import { RolesModule } from "./modules/roles/roles.module";
import { CacheModule } from "@nestjs/cache-manager";
import { redisStore } from "cache-manager-ioredis-yet";
import { InfrastructureModule } from "./infrastructure/infrastructure.module";

@Module({
  imports: [
    CacheModule.register({ ttl: 0, isGlobal: true, store: redisStore }),
    AuthModule,
    UsersModule,
    PrismaModule,
    PlayersModule,
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule,
    LogsModule,
    GameserverModule,
    ToolsModule,
    ThrottlerModule.forRoot(),
    SettingsModule,
    DiscordModule,
    RolesModule,
    InfrastructureModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    LoggerService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
