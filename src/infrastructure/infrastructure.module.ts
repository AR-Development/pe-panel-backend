import { Module } from "@nestjs/common";
import { DBConnectionFactory } from "./factories/dbconnection.factory";
import { UserCache } from "./cache/users";

@Module({
  providers: [DBConnectionFactory, UserCache],
  exports: [DBConnectionFactory, UserCache],
})
export class InfrastructureModule {}
