import {StoreSet, useDecorators} from "@tsed/core";
import {Injectable} from "@tsed/di";
import {QueueOptions, QUEUES} from "../interfaces";

export function Queue(options: QueueOptions): ClassDecorator {
  return useDecorators(Injectable({type: QUEUES}), StoreSet("queue", options)) as any;
}
