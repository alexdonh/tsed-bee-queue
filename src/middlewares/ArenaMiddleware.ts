import {Constant, IMiddleware, Inject, Middleware} from "@tsed/common";
import BullArena from "bull-arena";
import BeeQueue from "bee-queue";
import {QueueOptions, QueueSettings} from "../interfaces";
import {Store} from "@tsed/core";
import {RedisService} from "tsed-redis";

@Middleware()
export class ArenaMiddleware implements IMiddleware {
  @Inject()
  private redisService: RedisService;

  @Constant("queue")
  private queueSettings: QueueSettings;

  use() {
    const queues =
      this.queueSettings.providers?.map((q) => {
        const {name, hostId} = Store.from(q)?.get("queue") as QueueOptions;
        const redis: any =
          !this.queueSettings.redis || typeof this.queueSettings.redis === "string"
            ? this.redisService.get(hostId || this.queueSettings.redis) // use singleton di to avoid creating too much connections
            : this.queueSettings.redis;
        return {
          name,
          hostId: hostId || "default",
          type: "bee",
          redis
        };
      }) || [];
    return BullArena(
      {
        Bee: BeeQueue,
        queues
      },
      this.queueSettings.arenaListenOptions
    );
  }
}
