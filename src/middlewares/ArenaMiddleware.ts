import {classOf} from "@tsed/core";
import {Constant, Inject, InjectorService} from "@tsed/di";
import {Middleware, MiddlewareMethods} from "@tsed/platform-middlewares";
import BeeQueue from "bee-queue";
import BullArena from "bull-arena";
import {RequestHandler} from "express";
import {RedisService} from "tsed-redis";
import {QueueSettings} from "../interfaces";
import {QueueModule} from "../QueueModule";

@Middleware()
export class ArenaMiddleware implements MiddlewareMethods {
  @Inject(QueueModule)
  private readonly module: QueueModule;

  @Inject(RedisService)
  private readonly redis: RedisService;

  @Inject(InjectorService)
  private readonly injector: InjectorService;

  @Constant("queue")
  private readonly settings: QueueSettings;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  hanlder: RequestHandler = () => {};

  use = () => this.hanlder;

  $onReady() {
    if (this.settings.arena?.enabled) {
      const queueMap: Map<string, BullArena.QueueOptions & BullArena.ConnectionOptions> = new Map();
      for (const instance of this.module.queues.values()) {
        const provider = this.injector.getProvider(classOf(instance));
        if (!provider) {
          throw new Error(`Could not get DI provider of instance ${classOf(instance)}.`);
        }
        const {name, hostId} = this.module.getQueueMetadata(provider.token);
        if (!name) {
          continue;
        }
        const redis: any =
          !this.settings.redis || typeof this.settings.redis === "string"
            ? this.redis.get(hostId || this.settings.redis) // use singleton di to avoid creating too many connections
            : this.settings.redis;
        queueMap.set(name, {
          name,
          hostId: hostId || "default",
          type: "bee",
          redis,
          prefix: this.settings.prefix
        });
      }
      this.hanlder = BullArena({Bee: BeeQueue, queues: Array.from(queueMap, ([, opts]) => opts)}, this.settings.arena);
    }
  }
}
