export interface LogsModel {
  Id: string;
  CreatedAt: Date;
  IssuerPlayerId: string;
  IssuerPlayerName: string;
  ActionType: string;
  IssuerCoordinates: string;
  LogMessage: string;
  AffectedPlayers: object;
}
