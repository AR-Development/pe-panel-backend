import { BadRequestException, Injectable } from "@nestjs/common";
import {
  BanPlayerDto,
  RefundPlayerDto,
  FadePlayerDto,
} from "./dto/players.dto";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { LoggerService } from "../logger/logger.service";
import { UserEntity } from "src/users/entities/user.entity";
import { GameserverService } from "../gameserver/gameserver.service";
import { UnbanPlayerDto, WarnPlayerDto } from "./dto/players.dto";
import { SettingsEnums } from "../settings/settings.enums";
import { DiscordService } from "../discord/discord.service";
import { TokenPayload } from "src/auth/dto/auth.dto";
@Injectable()
export class PlayersService {
  constructor(
    private prismaService: PrismaService,
    private loggerService: LoggerService,
    private gameserverService: GameserverService,
    private discordSerivce: DiscordService
  ) {}

  async findAll(
    user: TokenPayload,
    page: number,
    limit: number,
    playerIdOrName = "",
    sortBy: string,
    sortType: "asc" | "desc",
    mode: "full" | "exact"
  ) {
    // Find the player based on the mode and playerIdOrName
    const idOfPlayer = await this.prismaService.playernames.findFirst({
      where: {
        PlayerName:
          mode === "full" ? { contains: playerIdOrName } : playerIdOrName,
      },
    });

    // Build the query to find players
    const playerData = await this.prismaService.players.findMany({
      where: {
        PlayerId: {
          contains: idOfPlayer ? idOfPlayer.PlayerId : playerIdOrName,
        },
      },
      select: {
        PlayerId: true,
        Name: true,
        Money: true,
        BankAmount: true,
      },
      orderBy: sortBy ? { [sortBy]: sortType || "asc" } : undefined,
      skip: page * limit,
      take: limit,
    });

    // Count the total number of players that match the condition
    const playerCount = await this.prismaService.players.count({
      where: {
        PlayerId: {
          contains: idOfPlayer ? idOfPlayer.PlayerId : playerIdOrName,
        },
      },
    });

    return [playerData, playerCount];
  }

  async findOne(user: TokenPayload, playerIdOrName: string) {
    return await this.prismaService.players.findFirst({
      where: {
        OR: [{ PlayerId: playerIdOrName }, { Name: playerIdOrName }],
      },
    });
  }

  async banPlayer(
    user: UserEntity,
    banPlayerDto: BanPlayerDto,
    announce: boolean,
    url: string
  ) {
    try {
      const gameserverResponse =
        await this.gameserverService.kickPlayerFromServer({
          PlayerId: banPlayerDto.playerId,
        });
    } catch (error) {
      console.error(error);
    }

    const result = await this.prismaService.banrecords.create({
      data: {
        PlayerId: banPlayerDto.playerId,
        PlayerName: banPlayerDto.playerName,
        BanEndsAt: new Date(banPlayerDto.banEndsAt),
        BanReason: banPlayerDto.banReason,
        BannedBy: user.username,
      },
    });

    const startDate = new Date();
    const endDate = new Date(banPlayerDto.banEndsAt);
    const seconds = (endDate.getTime() - startDate.getTime()) / 1000;
    const minutes = seconds / 60;

    await this.loggerService.createBanLogMessage(
      user.username,
      banPlayerDto.playerId,
      banPlayerDto.playerName,
      banPlayerDto.banReason,
      Math.round(minutes).toString()
    );

    await this.prismaService.playermodlogs.create({
      data: {
        PlayerName: banPlayerDto.playerName,
        PlayerId: banPlayerDto.playerId,
        Reason: banPlayerDto.banReason,
        BannedBy: user.username,
        PunishmentType: "BAN",
        DurationMin: Math.round(minutes),
      },
    });

    if (announce) {
      this.discordSerivce.triggerModlogEvent({
        punishedId: banPlayerDto.playerId,
        punisherName: user.username,
        punishmentDuration: `${Math.round(minutes)} minutes`,
        punishmentType: "BAN",
        reason: banPlayerDto.banReason,
        url: url,
        guildId: process.env.DISCORD_SERVER_ID,
      });
    }

    return result;
  }

  async warnPlayer(
    user: UserEntity,
    warnPlayerDto: WarnPlayerDto,
    announce: boolean,
    url: string
  ) {
    const result = await this.prismaService.playermodlogs.create({
      data: {
        PlayerId: warnPlayerDto.playerId,
        PlayerName: warnPlayerDto.playerName,
        PunishmentType: "WARNING",
        BannedBy: user.username,
        Reason: warnPlayerDto.warnReason,
      },
    });

    await this.loggerService.createWarnLogMessage(
      user.username,
      warnPlayerDto.playerId,
      warnPlayerDto.playerName,
      warnPlayerDto.warnReason
    );

    if (announce) {
      this.discordSerivce.triggerModlogEvent({
        punishedId: warnPlayerDto.playerId,
        punisherName: user.username,
        punishmentDuration: `-`,
        punishmentType: "WARNING",
        reason: warnPlayerDto.warnReason,
        url: url,
        guildId: process.env.DISCORD_SERVER_ID,
      });
    }

    return result;
  }

  async unbanPlayer(user: UserEntity, unbanPlayerDto: UnbanPlayerDto) {
    const updateResult = await this.prismaService.banrecords.updateMany({
      where: { PlayerId: unbanPlayerDto.playerId },
      data: {
        BanEndsAt: new Date(),
        UnbanReason: unbanPlayerDto.unbanReason,
      },
    });

    await this.loggerService.createUnbanLogMessage(
      user.username,
      unbanPlayerDto.playerId,
      unbanPlayerDto.playerName,
      unbanPlayerDto.unbanReason
    );

    return updateResult;
  }

  async refundPlayer(user: UserEntity, refundPlayerDto: RefundPlayerDto) {
    let result;
    let refundMoney;
    try {
      refundMoney = parseInt(refundPlayerDto.refundAmount);
    } catch (error) {
      throw new BadRequestException();
    }
    if (refundMoney < 0) {
      throw new BadRequestException();
    }

    const player = await this.prismaService.players.findUnique({
      where: { PlayerId: refundPlayerDto.playerId },
    });
    if (!refundPlayerDto.fromBank) {
      refundMoney =
        refundPlayerDto.deductMoney && refundMoney > player.Money
          ? Math.abs(player.Money)
          : refundMoney;
      try {
        result = await this.gameserverService.fundPlayerFromServer({
          PlayerId: refundPlayerDto.playerId,
          Gold: refundPlayerDto.deductMoney
            ? -Math.abs(refundMoney)
            : refundMoney,
        });
      } catch (error) {
        console.log(error);
        if (refundPlayerDto.deductMoney) {
          result = await this.prismaService.players.update({
            where: { PlayerId: refundPlayerDto.playerId },
            data: { Money: { decrement: refundMoney } },
          });
        } else {
          result = await this.prismaService.players.update({
            where: { PlayerId: refundPlayerDto.playerId },
            data: { Money: { increment: refundMoney } },
          });
        }
      }
    } else {
      refundMoney =
        refundPlayerDto.deductMoney && refundMoney > player.BankAmount
          ? Math.abs(player.BankAmount)
          : refundMoney;
      try {
        result = await this.prismaService.players.update({
          where: { PlayerId: refundPlayerDto.playerId },
          data: {
            BankAmount: refundPlayerDto.deductMoney
              ? { decrement: refundMoney }
              : { increment: refundMoney },
          },
        });
      } catch (error) {
        console.log(error);
        return;
      }
    }

    await this.loggerService.createRefundLogMessage(
      user.username,
      refundPlayerDto.playerName,
      refundPlayerDto.playerId,
      refundPlayerDto.refundAmount,
      refundPlayerDto.refundReason,
      refundPlayerDto.deductMoney,
      refundPlayerDto.fromBank
    );
    return result;
  }

  async fadePlayer(
    user: UserEntity,
    fadePlayerDto: FadePlayerDto,
    announce: boolean,
    url: string
  ) {
    try {
      await this.gameserverService.fadePlayerFromServer({
        PlayerId: fadePlayerDto.playerId,
      });
    } catch (error) {
      return { error: error };
    }

    await this.loggerService.createSlayLogMessage(
      user.username,
      fadePlayerDto.playerId,
      fadePlayerDto.playerName,
      fadePlayerDto.fadeReason
    );

    await this.prismaService.playermodlogs.create({
      data: {
        PlayerName: fadePlayerDto.playerName,
        PlayerId: fadePlayerDto.playerId,
        Reason: fadePlayerDto.fadeReason,
        BannedBy: user.username,
        PunishmentType: "FADE",
      },
    });

    if (announce) {
      this.discordSerivce.triggerModlogEvent({
        punishedId: fadePlayerDto.playerId,
        punisherName: user.username,
        punishmentDuration: `-`,
        punishmentType: "SLAY",
        reason: fadePlayerDto.fadeReason,
        url: url,
        guildId: process.env.DISCORD_SERVER_ID,
      });
    }

    return "OK";
  }

  async getBanList(
    user: UserEntity,
    page: number,
    limit: number,
    playerIdOrName = ""
  ) {
    const [banData, banCount] = await Promise.all([
      this.prismaService.banrecords.findMany({
        where: {
          BanEndsAt: {
            gt: new Date(),
          },
          OR: [
            {
              PlayerName: {
                contains: playerIdOrName,
              },
            },
            {
              PlayerId: {
                contains: playerIdOrName,
              },
            },
          ],
        },
        skip: page * limit,
        take: limit,
      }),
      this.prismaService.banrecords.count({
        where: {
          BanEndsAt: {
            gt: new Date(),
          },
          OR: [
            {
              PlayerName: {
                contains: playerIdOrName,
              },
            },
            {
              PlayerId: {
                contains: playerIdOrName,
              },
            },
          ],
        },
      }),
    ]);

    return [banData, banCount];
  }

  async getPlayerModLog(
    user: UserEntity,
    page: number,
    limit: number,
    playerId: string
  ) {
    const config = await this.prismaService.panelconfigs.findUnique({
      where: { ConfigName: SettingsEnums.MODLOG_EXPIRE_INTERVAL_DAYS },
    });

    const days = parseInt(config?.ConfigValue || "0");
    let expireDate = null;
    if (config) {
      const date = new Date();
      expireDate = new Date(date.getTime() - days * 24 * 60 * 60 * 1000);
    }

    const [modLogData, modLogCount] = await Promise.all([
      this.prismaService.playermodlogs.findMany({
        where: {
          PlayerId: playerId,
          CreatedAt: {
            gte: expireDate || new Date(0),
          },
        },
        skip: page * limit,
        take: limit,
      }),
      this.prismaService.playermodlogs.count({
        where: {
          PlayerId: playerId,
          CreatedAt: {
            gte: expireDate || new Date(0),
          },
        },
      }),
    ]);

    return [modLogData, modLogCount];
  }

  async searchPlayer(
    user: UserEntity,
    playerName: string,
    search: "exact" | "full" = "exact"
  ) {
    const result = await this.prismaService.playernames.findMany({
      where: {
        PlayerName: {
          contains: search === "full" ? playerName : `${playerName}%`,
        },
      },
      take: 10,
    });

    return result;
  }
}
