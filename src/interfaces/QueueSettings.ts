import {Type} from "@tsed/core";
import {QueueSettings as Settings} from "bee-queue";
import {QueueProvider} from "./QueueProvider";

export interface ArenaListenOptions {
  port?: number;
  host?: string;
  basePath?: string;
  disableListen?: boolean;
  useCdn?: boolean;
}
export interface QueueSettings extends Settings {
  providers?: Type<QueueProvider>[];
  arenaListenOptions?: ArenaListenOptions;
}
