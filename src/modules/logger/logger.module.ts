import { Module, Global } from "@nestjs/common";
import { LoggerService } from "./logger.service";
import { InfrastructureModule } from "src/infrastructure/infrastructure.module";

@Global()
@Module({
  providers: [LoggerService],
  imports: [InfrastructureModule],
  exports: [LoggerService],
})
export class LoggerModule {}
