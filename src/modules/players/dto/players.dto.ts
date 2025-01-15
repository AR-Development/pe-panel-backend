export class BanPlayerDto {
  playerId: string;
  playerName: string;
  banEndsAt: string;
  banReason: string;
}

export class RefundPlayerDto {
  playerId: string;
  playerName: string;
  refundAmount: string;
  deductMoney: boolean;
  fromBank: boolean;
  refundReason: string;
}

export class FadePlayerDto {
  playerId: string;
  playerName: string;
  fadeReason: string;
}

export class UnbanPlayerDto {
  playerId: string;
  playerName: string;
  unbanReason: string;
}

export class WarnPlayerDto {
  playerId: string;
  playerName: string;
  warnReason: string;
}
