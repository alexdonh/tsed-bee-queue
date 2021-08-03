import {StoreSet, useDecorators} from "@tsed/core";
import {QueueOptions} from "../interfaces/QueueOptions";
import {registerQueue} from "../registries/QueueRegistry";

export function Queue(options: QueueOptions): ClassDecorator {
  return useDecorators(registerQueue, StoreSet("queue", options)) as any;
}
