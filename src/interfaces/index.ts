import {QueueSettings} from "./QueueSettings";

declare global {
  namespace TsED {
    interface Configuration {
      queue?: QueueSettings;
    }
  }
}

export * from "./QueueSettings";
export * from "./QueueProvider";
export * from "./QueueOptions";
