import {Constant, IMiddleware, Inject, Middleware} from "@tsed/common";
import BullArena from "bull-arena";
import BeeQueue from "bee-queue";
import {RedisClient} from "redis";
import {QueueOptions, QueueSettings} from "../interfaces";
import {Store} from "@tsed/core";
import {capitalize} from "lodash";

@Middleware()
export class ArenaMiddleware implements IMiddleware {
  @Inject(RedisClient)
  private redis: RedisClient;

  @Constant("queue")
  private queueSettings: QueueSettings;

  use() {
    const queues =
      this.queueSettings.providers?.map((q) => {
        const {name, label} = Store.from(q)?.get("queue") as QueueOptions;
        return {
          name,
          hostId: capitalize(label || name),
          type: "bee",
          redis: this.redis as any // use singleton di to avoid creating too much connections
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
