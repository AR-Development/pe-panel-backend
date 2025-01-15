import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Res,
  StreamableFile,
  UseGuards,
} from "@nestjs/common";
import type { Response } from "express";
import { LogsService } from "./logs.service";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { User } from "src/decorators/user.decorator";
import { TokenPayload } from "src/auth/dto/auth.dto";
import { Roles } from "src/decorators/role.decarator";

@Controller("logs")
export class LogsController {
  constructor(
    private readonly logsService: LogsService,
    private readonly prismaService: PrismaService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Roles("ReadServerLogs")
  @Get("server")
  async getServerLogs(
    @Query("page") _page: string,
    @Query("limit") _limit: string,
    @Query("startTime") _startTime: string,
    @Query("endTime") _endTime: string,
    @Query("playerNames") _playerNames: string,
    @Query("mode") _mode: "OR" | "AND",
    @Query("actions") _actions: string,
    @User() user: TokenPayload
  ) {
    const page = _page ? parseInt(_page) : 0;
    const limit = _limit ? parseInt(_limit) : 25;
    const playerNames = _playerNames ? _playerNames.split(",") : [];
    const actions = _actions ? _actions.split(",") : [];
    if (!_startTime || !_endTime) {
      throw new BadRequestException(
        "You must specify start time and end time."
      );
    }
    return await this.logsService.getServerLogs(
      user,
      page,
      limit,
      _startTime,
      _endTime,
      playerNames,
      actions,
      _mode
    );
  }

  @UseGuards(JwtAuthGuard)
  @Roles("ReadPanelLogs")
  @Get("panel")
  async getPanelLogs(
    @Query("page") _page: string,
    @Query("limit") _limit: string,
    @Query("startTime") _startTime: string | undefined,
    @Query("endTime") _endTime: string | undefined,
    @Query("username") _username: string,
    @User() user: TokenPayload
  ) {
    const page = _page ? parseInt(_page) : 0;
    const limit = _limit ? parseInt(_limit) : 25;
    return await this.logsService.getPanelLogs(
      user,
      page,
      limit,
      _startTime,
      _endTime,
      _username
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get("server/txt")
  async getServerLogsAsTxtFile(
    @Res() res: Response,
    @Query("startTime") _startTime: string,
    @Query("endTime") _endTime: string,
    @Query("playerNames") _playerNames: string,
    @Query("mode") _mode: "AND" | "OR",
    @Query("actions") _actions: string,
    @User() user: TokenPayload
  ) {
    const playerNames = _playerNames ? _playerNames.split(",") : [];
    const actions = _actions ? _actions.split(",") : [];
    if (!_startTime || !_endTime) {
      throw new BadRequestException(
        "You must specify start time and end time."
      );
    }

    const filename = "logs.txt";

    res.header("Content-Type", "text/plain");
    res.header("Content-Disposition", `attachment; filename="${filename}"`);

    let service = this.logsService;

    try {
      const batchSize = 1000;
      let offset = 0;

      while (true) {
        const logs = await service.getServerLogs(
          user,
          offset,
          batchSize,
          _startTime,
          _endTime,
          playerNames,
          actions,
          _mode
        );
        if (logs[0].length === 0) {
          // No more logs to fetch, close the response stream
          break;
        }
        const parsedLogs = await service.parseLogsAndReturn(logs[0]);
        const buf = Buffer.from(parsedLogs);
        await res.write(buf);
        offset += 1;
      }
      await res.end();
      // Start fetching and sending logs in batches
      // sendNextBatch();
    } catch (error) {
      console.error("Error fetching or processing logs:", error);
      res.status(500).send("Error fetching or processing logs");
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get("actiontypes")
  async getActions() {
    return await this.logsService.fetchActionTypes();
  }
}
