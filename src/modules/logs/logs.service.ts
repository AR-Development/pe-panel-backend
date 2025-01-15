import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { actionTypes } from "./logs.actions";
import { TokenPayload } from "src/auth/dto/auth.dto";
import { DBConnectionFactory } from "src/infrastructure/factories/dbconnection.factory";
import { LogsModel } from "src/models/logs.model";
import { logs, Prisma } from "@prisma/client";

@Injectable()
export class LogsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly connFactory: DBConnectionFactory
  ) {}

  async getServerLogs(
    user: TokenPayload,
    page: number,
    limit: number,
    startTime: string,
    endTime: string,
    playerNames: string[] = [],
    actions: string[],
    _mode?: "OR" | "AND"
  ) {
    const mode = _mode ? _mode : "OR";

    const db = await this.connFactory.retrieveConnection();

    const results = await db.transaction(async (trx) => {
      const logsQuery = db.select("*").from("logs");
      const countQuery = db.count("* as count").from("logs");

      if (page !== -1 && limit !== -1) {
        logsQuery.offset(page * limit).limit(limit);
      }

      logsQuery.whereBetween("CreatedAt", [
        new Date(startTime),
        new Date(endTime),
      ]);
      countQuery.whereBetween("CreatedAt", [
        new Date(startTime),
        new Date(endTime),
      ]);

      if (playerNames.length > 0) {
        if (mode === "AND") {
          playerNames.forEach((item) => {
            logsQuery.where("LogMessage", "like", `%${item}%`);
            countQuery.where("LogMessage", "like", `%${item}%`);
          });
        } else {
          logsQuery.where(function () {
            this.where(function () {
              this.whereIn("IssuerPlayerName", playerNames);
            }).orWhere(function () {
              playerNames.forEach((name) => {
                this.orWhereRaw("JSON_CONTAINS(AffectedPlayers, ?)", [
                  JSON.stringify(name),
                ]);
              });
            });
          });

          countQuery.where(function () {
            this.where(function () {
              this.whereIn("IssuerPlayerName", playerNames);
            }).orWhere(function () {
              playerNames.forEach((name) => {
                this.orWhereRaw("JSON_CONTAINS(AffectedPlayers, ?)", [
                  JSON.stringify(name),
                ]);
              });
            });
          });
        }
      }

      if (actions.length > 0) {
        logsQuery.whereIn("ActionType", actions);
        countQuery.whereIn("ActionType", actions);
      }

      logsQuery.orderBy("CreatedAt", "asc");

      const logResults = await logsQuery.transacting(trx);
      const countResult = await countQuery.transacting(trx);

      return [logResults, (countResult[0] as any).count];
    });
    return results;
  }

  async getPanelLogs(
    user: TokenPayload,
    page: number,
    limit: number,
    startTime?: string,
    endTime?: string,
    username = ""
  ) {
    const db = await this.connFactory.retrieveConnection();
    const results = await db.transaction(async (trx) => {
      const logsQuery = db.select("*").from("panellogs");
      const countQuery = db.count("* as count").from("panellogs");

      if (page !== -1 && limit !== -1) {
        logsQuery.offset(page * limit).limit(limit);
      }

      if (startTime && endTime) {
        logsQuery.whereBetween("CreatedAt", [
          new Date(startTime),
          new Date(endTime),
        ]);
        countQuery.whereBetween("CreatedAt", [
          new Date(startTime),
          new Date(endTime),
        ]);
      }

      if (username) {
        logsQuery.where("Username", "like", `%${username}%`);
        countQuery.where("Username", "like", `%${username}%`);
      }

      const logResults = await logsQuery.transacting(trx);
      const countResult = await countQuery.transacting(trx).first();

      return [logResults, countResult.count];
    });

    return results;
  }

  async parseLogsAndReturn(logs: LogsModel[]) {
    let temp = "";
    logs.forEach((item) => {
      temp += `${item.CreatedAt.toUTCString()} - ${item.LogMessage}\n`;
    });
    return temp;
  }

  async fetchActionTypes() {
    return actionTypes;
  }
}
