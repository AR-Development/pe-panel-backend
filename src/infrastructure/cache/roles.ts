import { Injectable } from "@nestjs/common";
import { CacheService, CacheTypes } from "./cache.service";
import { RoleCacheModel } from "./types/cache.types";

@Injectable()
export class RoleCache extends CacheService {
  public async getRole(roleId: number): Promise<RoleCacheModel> {
    const cachedUserPower = await this.retrieve<RoleCacheModel>(
      roleId.toString(),
      CacheTypes.ROLES
    );
    if (cachedUserPower) {
      return cachedUserPower;
    } else {
      await this.updateCache(roleId.toString(), CacheTypes.ROLES);
      return await this.retrieve<RoleCacheModel>(
        roleId.toString(),
        CacheTypes.ROLES
      );
    }
  }
}
