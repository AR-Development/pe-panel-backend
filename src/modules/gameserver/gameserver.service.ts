import { HttpService } from "@nestjs/axios";
import { Injectable, Logger } from "@nestjs/common";
import {
  GameServerAnnouncementDto,
  GameServerFadeDto,
  GameServerKickDto,
  GameServerRefundDto,
} from "./dto/gameserver.dto";

@Injectable()
export class GameserverService {
  private readonly logger = new Logger(GameserverService.name);
  constructor(private readonly httpService: HttpService) {}

  async kickPlayerFromServer(dto: GameServerKickDto) {
    try {
      const response = this.httpService.axiosRef.post(
        `${process.env.GAME_WEBAPI_URL}/kickplayer`,
        dto,
        {
          headers: {
            Authorization: process.env.GAME_WEBAPI_TOKEN,
          },
        }
      );
      return response;
    } catch (error) {
      this.logger.error(error, error.stack);
    }
  }

  async fundPlayerFromServer(dto: GameServerRefundDto) {
    try {
      const response = this.httpService.axiosRef.post(
        `${process.env.GAME_WEBAPI_URL}/compensateplayer`,
        dto,
        {
          headers: {
            Authorization: process.env.GAME_WEBAPI_TOKEN,
          },
        }
      );
      return response;
    } catch (error) {
      this.logger.error(error, error.stack);
    }
  }

  async fadePlayerFromServer(dto: GameServerFadeDto) {
    try {
      const response = this.httpService.axiosRef.post(
        `${process.env.GAME_WEBAPI_URL}/fadeplayer`,
        dto,
        {
          headers: {
            Authorization: process.env.GAME_WEBAPI_TOKEN,
          },
        }
      );
      return response;
    } catch (error) {
      this.logger.error(error, error.stack);
    }
  }

  async makeAnnouncementInGame(dto: GameServerAnnouncementDto) {
    try {
      const response = this.httpService.axiosRef.post(
        `${process.env.GAME_WEBAPI_URL}/announce`,
        { Message: `[${dto.Sender}] ${dto.Message}` },
        {
          headers: {
            Authorization: process.env.GAME_WEBAPI_TOKEN,
          },
        }
      );
      return response;
    } catch (error) {
      this.logger.error(error, error.stack);
    }
  }
}
