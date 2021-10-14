import {QueueSettings} from "bee-queue";
export interface QueueOptions
  extends Pick<QueueSettings, "stallInterval" | "nearTermWindow" | "delayedDebounce" | "removeOnSuccess" | "removeOnFailure"> {
  name: string;
  hostId?: string; // redis connection
  concurrency?: number;
  [key: string]: any;
}
