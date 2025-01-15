import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { DiscordService } from './discord.service';

@Module({
  providers: [DiscordService],
  imports: [
    HttpModule.register({
      baseURL: process.env.DISCORD_BOT_URL,
    }),
  ],
  exports: [DiscordService],
})
export class DiscordModule {}
