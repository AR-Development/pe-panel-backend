export class GameServerKickDto {
  PlayerId: string;
}

export class GameServerFadeDto extends GameServerKickDto {}

export class GameServerRefundDto extends GameServerKickDto {
  Gold: number;
}

export class GameServerAnnouncementDto {
  Sender: string;
  Message: string;
}
