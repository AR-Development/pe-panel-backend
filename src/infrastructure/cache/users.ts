import { Injectable } from "@nestjs/common";
import { CacheService, CacheTypes } from "./cache.service";
import { UserCacheModel } from "./types/cache.types";

@Injectable()
export class UserCache extends CacheService {
  public async getUser(userId: string): Promise<UserCacheModel> {
    const cachedUserPower = await this.retrieve<UserCacheModel>(
      userId,
      CacheTypes.USERS
    );
    if (cachedUserPower) {
      return cachedUserPower;
    } else {
      await this.updateCache(userId, CacheTypes.USERS);
      return await this.retrieve<UserCacheModel>(userId, CacheTypes.USERS);
    }
  }
}
