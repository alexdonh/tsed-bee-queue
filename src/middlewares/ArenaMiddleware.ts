import {Constant, IMiddleware, Inject, Middleware} from "@tsed/common";
import BeeQueue from "bee-queue";
import BullArena from "bull-arena";
import {RedisService} from "tsed-redis";
import {QueueSettings} from "../interfaces";
import {QueueModule} from "../QueueModule";

@Middleware()
export class ArenaMiddleware implements IMiddleware {
  @Inject()
  private redisService: RedisService;

  @Inject()
  private queueModule: QueueModule;

  @Constant("queue")
  private queueSettings: QueueSettings;

  use() {
    const queues = [];
    for (const provider of this.queueModule.providers.values()) {
      const {name, hostId} = this.queueModule.getQueueMetadata(provider.useClass);
      if (!name) {
        continue;
      }
      const redis: any =
        !this.queueSettings.redis || typeof this.queueSettings.redis === "string"
          ? this.redisService.get(hostId || this.queueSettings.redis) // use singleton di to avoid creating too much connections
          : this.queueSettings.redis;
      queues.push({
        name,
        hostId: hostId || "default",
        type: "bee",
        redis
      });
    }
    return BullArena({Bee: BeeQueue, queues}, this.queueSettings.arenaListenOptions);
  }
}
