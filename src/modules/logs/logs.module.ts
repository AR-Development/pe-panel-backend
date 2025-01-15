import { Module } from "@nestjs/common";
import { LogsService } from "./logs.service";
import { LogsController } from "./logs.controller";
import { InfrastructureModule } from "src/infrastructure/infrastructure.module";

@Module({
  controllers: [LogsController],
  providers: [LogsService],
  imports: [InfrastructureModule],
})
export class LogsModule {}
