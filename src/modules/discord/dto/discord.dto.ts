export class CreateModlogMessageDto {
  punisherName: string;
  punishmentType: 'WARNING' | 'BAN' | 'SLAY';
  punishmentDuration: string;
  punishedId: string;
  reason: string;
  guildId: string;
  url: string;
}
