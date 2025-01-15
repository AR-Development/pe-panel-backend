import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
  BadRequestException,
  ParseBoolPipe,
} from "@nestjs/common";
import { PlayersService } from "./players.service";
import {
  BanPlayerDto,
  RefundPlayerDto,
  FadePlayerDto,
  WarnPlayerDto,
} from "./dto/players.dto";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { AdminGuard } from "../../users/user.guard";
import { User } from "src/decorators/user.decorator";
import { UserEntity } from "../../users/entities/user.entity";
import { UnbanPlayerDto } from "./dto/players.dto";
import { TokenPayload } from "src/auth/dto/auth.dto";
import { Roles } from "src/decorators/role.decarator";

@Controller("players")
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @Query("page") _page: string,
    @Query("limit") _limit: string,
    @Query("player") _playerIdOrName: string,
    @Query("sortBy") _sortBy: string,
    @Query("sortType") _sortType: "asc" | "desc",
    @Query("mode") _mode: "exact" | "full",
    @User() user: TokenPayload
  ) {
    const page = _page ? parseInt(_page) : 0;
    const limit = _limit ? parseInt(_limit) : 25;
    return this.playersService.findAll(
      user,
      page,
      limit,
      _playerIdOrName,
      _sortBy,
      _sortType,
      _mode
    );
  }

  @UseGuards(JwtAuthGuard)
  @Roles("ViewPlayerDetails")
  @Get("info")
  findOne(
    @Query("playerId") _playerIdOrName: string,
    @User() user: TokenPayload
  ) {
    if (_playerIdOrName) {
      return this.playersService.findOne(user, _playerIdOrName);
    } else {
      throw new BadRequestException("player query field must be filled.");
    }
  }

  @UseGuards(JwtAuthGuard)
  @Roles("ViewBanlist")
  @Get("banlist")
  async serverBanList(
    @Query("page") _page: string,
    @Query("limit") _limit: string,
    @Query("player") _playerIdOrName: string,
    @User() user: TokenPayload
  ) {
    const page = _page ? parseInt(_page) : 0;
    const limit = _limit ? parseInt(_limit) : 25;
    return await this.playersService.getBanList(
      user,
      page,
      limit,
      _playerIdOrName
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get("modlog/:playerId")
  async playerModerationLogs(
    @Query("page") _page: string,
    @Query("limit") _limit: string,
    @Param("playerId") _playerId: string,
    @User() user: TokenPayload
  ) {
    const page = _page ? parseInt(_page) : 0;
    const limit = _limit ? parseInt(_limit) : 6;
    if (!_playerId || _playerId.length === 0) {
      throw new BadRequestException("Player ID must be specified.");
    }
    return await this.playersService.getPlayerModLog(
      user,
      page,
      limit,
      _playerId
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get("search")
  async playerSearch(
    @Query("playername") _playername: string,
    @Query("search") _search: "full" | "exact",
    @User() user: TokenPayload
  ) {
    return await this.playersService.searchPlayer(user, _playername, _search);
  }

  @UseGuards(JwtAuthGuard)
  @Roles("BanPlayers")
  @Post("ban")
  async playerBan(
    @Body() banPlayerDto: BanPlayerDto,
    @User() user: UserEntity,
    @Query("announce", ParseBoolPipe) _announce: boolean,
    @Query("url") _url
  ) {
    const announce = _announce !== null ? _announce : false;
    await this.playersService.banPlayer(user, banPlayerDto, announce, _url);
    return { status: "OK" };
  }

  @UseGuards(JwtAuthGuard)
  @Roles("WarnPlayers")
  @Post("warn")
  async playerWarn(
    @Body() warnPlayerDto: WarnPlayerDto,
    @User() user: UserEntity,
    @Query("announce", ParseBoolPipe) _announce: boolean,
    @Query("url") _url
  ) {
    const announce = _announce !== null ? _announce : false;
    await this.playersService.warnPlayer(user, warnPlayerDto, announce, _url);
    return { status: "OK" };
  }

  @UseGuards(JwtAuthGuard)
  @Roles("UnbanPlayers")
  @Post("unban")
  async playerUnban(
    @Body() unbanPlayerDto: UnbanPlayerDto,
    @User() user: UserEntity
  ) {
    await this.playersService.unbanPlayer(user, unbanPlayerDto);
    return { status: "OK" };
  }

  @UseGuards(JwtAuthGuard)
  @Roles("RefundPlayers")
  @Post("refund")
  async playerRefund(
    @Body() refundPlayerDto: RefundPlayerDto,
    @User() user: UserEntity
  ) {
    await this.playersService.refundPlayer(user, refundPlayerDto);
    return { status: "OK" };
  }

  @UseGuards(JwtAuthGuard)
  @Roles("FadePlayers")
  @Post("fade")
  async playerFade(
    @Body() fadePlayerDto: FadePlayerDto,
    @User() user: UserEntity,
    @Query("announce", ParseBoolPipe) _announce: boolean,
    @Query("url") _url
  ) {
    const announce = _announce !== null ? _announce : false;
    await this.playersService.fadePlayer(user, fadePlayerDto, announce, _url);
    return { status: "OK" };
  }
}
