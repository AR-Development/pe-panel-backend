import { CACHE_MANAGER } from "@nestjs/cache-manager";
import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { Cache } from "cache-manager";
import { PrismaService } from "../prisma/prisma.service";
import { RoleCacheModel, UserCacheModel } from "./types/cache.types";

export enum CacheTypes {
  "USERS" = "user",
  "ROLES" = "role",
}

@Injectable()
export abstract class CacheService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly prismaService: PrismaService
  ) {}

  public async resetCache() {
    await this.cacheManager.reset();
  }

  protected async update<T>(
    key: string,
    type: CacheTypes,
    value: T,
    ttl?: number
  ) {
    const fullKey = this.keyParser(key, type);
    await this.cacheManager.set(fullKey, value, ttl);
  }

  protected async retrieve<T>(key: string, type: CacheTypes): Promise<T> {
    const cached = await this.cacheManager.get<T>(this.keyParser(key, type));
    if (cached) {
      return cached;
    } else {
      return null;
    }
  }

  protected async updateCache(id: string, type: CacheTypes) {
    switch (type) {
      case CacheTypes.USERS:
        if (typeof id === "string") {
          const result = await this.prismaService.users.findFirst({
            where: { Id: parseInt(id) },
            include: { role: true },
          });
          await this.update<UserCacheModel>(
            result.Id.toString(),
            CacheTypes.USERS,
            {
              power: result.role.PermissionBit,
              administrator: result.Administrator,
            },
            12 * 60 * 60 * 1000 // 12h
          );
        } else {
          throw new InternalServerErrorException(
            "Users primary key type error."
          );
        }
        break;

      case CacheTypes.ROLES:
        if (typeof id === "string") {
          const result = await this.prismaService.panelroles.findFirst({
            where: { Id: parseInt(id) },
          });
          await this.update<RoleCacheModel>(
            id,
            CacheTypes.ROLES,
            {
              permissionBits: result.PermissionBit,
            },
            12 * 60 * 60 * 1000 // 12h
          );
        } else {
          throw new InternalServerErrorException(
            "Users primary key type error."
          );
        }
        break;

      default:
        break;
    }
  }

  private keyParser(key: string, type: CacheTypes) {
    let fullKey: string;

    return fullKey;
  }
}
