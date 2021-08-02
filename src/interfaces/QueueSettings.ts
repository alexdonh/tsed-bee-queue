import {Type} from "@tsed/core";
import {QueueSettings as Settings} from "bee-queue";
import {ClientOpts, RedisClient} from "redis";
import {QueueProvider} from "./QueueProvider";

type Modify<T, R> = Omit<T, keyof R> & R;

export interface ArenaListenOptions {
  port?: number;
  host?: string;
  basePath?: string;
  disableListen?: boolean;
  useCdn?: boolean;
}
export type QueueSettings = Modify<
  Settings,
  {
    redis?: string | ClientOpts | RedisClient;
    providers?: Type<QueueProvider>[];
    arenaListenOptions?: ArenaListenOptions;
  }
>;
