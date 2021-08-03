import {QueueSettings} from "./QueueSettings";

declare global {
  namespace TsED {
    interface Configuration {
      queue?: QueueSettings;
    }
  }
}

export * from "./QueueOptions";
export * from "./QueueProvider";
export * from "./QueueSettings";
