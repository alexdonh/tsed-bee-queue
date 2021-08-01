import {Type} from "@tsed/core";
import {QueueSettings as Settings} from "bee-queue";
import {QueueProvider} from "./QueueProvider";
export interface QueueSettings extends Settings {
  providers?: Type<QueueProvider>[];
  enableArena?: boolean;
  arenaBasePath?: string;
}
