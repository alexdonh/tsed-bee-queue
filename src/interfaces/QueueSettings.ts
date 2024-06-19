import {QueueSettings as Settings} from "bee-queue";
import type {RedisOptions, RedisProvider} from "tsed-redis";

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
    redis?: string | RedisOptions<RedisProvider>;
    arena?: ArenaOptions;
  }
>;
