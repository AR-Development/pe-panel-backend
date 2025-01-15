import { Injectable } from "@nestjs/common";
import { DBConnectionFactory } from "src/infrastructure/factories/dbconnection.factory";
import { PrismaService } from "src/infrastructure/prisma/prisma.service";

@Injectable()
export class LoggerService {
  constructor(private readonly prismaService: PrismaService) {}

  async createBanLogMessage(
    issuerUserName: string,
    bannedPlayerId: string,
    bannedPlayerName: string,
    reason: string,
    duration: string
  ) {
    const logMessage = `${issuerUserName} banned player ${bannedPlayerName} (${bannedPlayerId}) for ${duration} minutes. Reason: ${reason}`;
    try {
      await this.prismaService.panellogs.create({
        data: {
          ActionType: "BAN",
          LogMessage: logMessage,
          Username: issuerUserName,
        },
      });
    } catch (error) {
      console.error(error);
    }
  }

  async createUnbanLogMessage(
    issuerUserName: string,
    unbannedPlayerId: string,
    unbannedPlayerName: string,
    reason: string
  ) {
    const logMessage = `${issuerUserName} unbanned player ${unbannedPlayerName} (${unbannedPlayerId}). Reason: ${reason}`;
    try {
      await this.prismaService.panellogs.create({
        data: {
          ActionType: "UNBAN",
          LogMessage: logMessage,
          Username: issuerUserName,
        },
      });
    } catch (error) {
      console.error(error);
    }
  }

  async createSlayLogMessage(
    issuerUserName: string,
    slayedPlayerId: string,
    slayedPlayerName: string,
    slayReason: string
  ) {
    const logMessage = `${issuerUserName} slayed player ${slayedPlayerName} (${slayedPlayerId}). Reason: ${slayReason}`;
    try {
      await this.prismaService.panellogs.create({
        data: {
          ActionType: "SLAY",
          LogMessage: logMessage,
          Username: issuerUserName,
        },
      });
    } catch (error) {
      console.error(error);
    }
  }

  async createRefundLogMessage(
    issuerUserName: string,
    refundedPlayerName: string,
    refundedPlayerId: string,
    refundAmount: string,
    refundReason: string,
    deductMoney: boolean,
    fromBank: boolean
  ) {
    const actionType = deductMoney ? "DEDUCT" : "REFUND";
    const fromWhere = fromBank
      ? "from players bank"
      : "from players money pocket";

    const logMessage = `${issuerUserName} ${actionType} money ${fromWhere} ${refundedPlayerName} (${refundedPlayerId}) with an amount of ${refundAmount}. Reason: ${refundReason}`;

    try {
      await this.prismaService.panellogs.create({
        data: {
          ActionType: actionType,
          LogMessage: logMessage,
          Username: issuerUserName,
        },
      });
    } catch (error) {
      console.error(error);
    }
  }

  async createPlayerEditMessage(
    issuerUserName: string,
    issuedPlayerName: string,
    issuedPlayerId: string,
    playerOldState: string,
    playerNewState: string
  ) {
    const logMessage = `${issuerUserName} edited the ${issuedPlayerName} (${issuedPlayerId}) player properties. Player properties before change: ${playerOldState}. New properties: ${playerNewState}`;
    try {
      await this.prismaService.panellogs.create({
        data: {
          ActionType: "EDIT",
          LogMessage: logMessage,
          Username: issuerUserName,
        },
      });
    } catch (error) {
      console.error(error);
    }
  }

  async createWarnLogMessage(
    issuerUserName: string,
    warnedPlayerId: string,
    warnedPlayerName: string,
    reason: string
  ) {
    const logMessage = `${issuerUserName} warned player ${warnedPlayerName} (${warnedPlayerId}). Reason: ${reason}`;
    try {
      await this.prismaService.panellogs.create({
        data: {
          ActionType: "WARNING",
          LogMessage: logMessage,
          Username: issuerUserName,
        },
      });
    } catch (error) {
      console.error(error);
    }
  }
}
