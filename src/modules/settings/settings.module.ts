import { Module } from "@nestjs/common";
import { SettingsService } from "./settings.service";
import { SettingsController } from "./settings.controller";
import { InfrastructureModule } from "src/infrastructure/infrastructure.module";

@Module({
  controllers: [SettingsController],
  providers: [SettingsService],
  imports: [InfrastructureModule],
})
export class SettingsModule {}
