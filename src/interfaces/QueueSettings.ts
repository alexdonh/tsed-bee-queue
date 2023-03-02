import {QueueSettings as Settings} from "bee-queue";
import type {RedisClientOptions, RedisClientType} from "redis";

type Modify<T, R> = Omit<T, keyof R> & R;

export interface ArenaOptions {
  enabled: boolean;
  port?: number;
  host?: string;
  basePath?: string;
  disableListen?: boolean;
  useCdn?: boolean;
}
export type QueueSettings = Modify<
  Settings,
  {
    redis?: string | RedisClientOptions | RedisClientType;
    arena?: ArenaOptions;
  }
>;
