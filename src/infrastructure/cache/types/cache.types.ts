export type CacheModels = UserCacheModel | RoleCacheModel;

export type UserCacheModel = {
  power: number;
  administrator: boolean;
};

export type RoleCacheModel = {
  permissionBits: number;
};
