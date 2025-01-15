import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom, catchError } from 'rxjs';
import { CreateModlogMessageDto } from './dto/discord.dto';

@Injectable()
export class DiscordService {
  constructor(private readonly httpService: HttpService) {}
  async triggerModlogEvent(dto: CreateModlogMessageDto) {
    return await firstValueFrom(
      this.httpService
        .post('events/modlog', dto)
        .pipe(catchError(async (error) => console.error(error))),
    );
  }
}
