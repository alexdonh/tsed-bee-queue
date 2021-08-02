import {Constant, Inject, Service} from "@tsed/di";
import {Logger} from "@tsed/logger";
import BeeQueue from "bee-queue";
import {RedisService} from "tsed-redis";
import {QueueSettings} from "../interfaces";

@Service()
export class QueueService {
  private readonly queues: Map<string, BeeQueue> = new Map();

  @Inject()
  readonly logger: Logger;

  @Inject(RedisService)
  readonly redisService: RedisService;

  @Constant("queue", {})
  protected readonly queueSettings: QueueSettings;

  get(name: string, hostId?: string): BeeQueue {
    let queue = this.queues.get(name);
    if (!queue) {
      const {redis, ...settings} = this.queueSettings;
      const redisClient = !redis || typeof redis === "string" ? this.redisService.get(hostId || redis) : undefined;
      queue = new BeeQueue(name, {redis: redisClient, ...settings});
      queue.on("ready", () => {
        this.logger.info(`Queue '${name}' is ready`);
      });
      this.queues.set(name, queue);
    }
    return queue;
  }

  has(name: string): boolean {
    return this.queues.has(name);
  }

  async close() {
    for (const [name, queue] of this.queues.entries()) {
      await queue.close().then(() => {
        this.queues.delete(name);
      });
    }
  }
}
