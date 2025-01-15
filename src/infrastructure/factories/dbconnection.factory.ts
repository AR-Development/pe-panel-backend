import { Injectable } from "@nestjs/common";
import knex, { Knex } from "knex";
import { PrismaService } from "src/infrastructure/prisma/prisma.service";

@Injectable()
export class DBConnectionFactory {
  private connection;

  constructor(private readonly prismaService: PrismaService) {
    const config: Knex.Config = {
      client: "mysql2",
      connection: {
        ...this.parseDatabaseUrl(process.env.DATABASE_URL),
        connectTimeout: 20000,
      },
    };
    this.connection = knex(config);
  }

  public async retrieveConnection(): Promise<knex.Knex<any, any[]>> {
    if (this.connection) {
      return this.connection;
    } else {
      throw new Error("DB Connection not found");
    }
  }

  public async removeConnection(tenantId: string) {
    return null;
  }

  private parseDatabaseUrl(connectionString: string) {
    const regex = /mysql:\/\/(.*?):(.*?)@(.*?):(\d+)\/(.*)/;
    const match = connectionString.match(regex);

    if (!match) {
      throw new Error("Invalid connection string format");
    }

    const [_, user, password, host, port, database] = match;

    return {
      host,
      port: parseInt(port),
      user,
      password,
      database,
    };
  }
}
