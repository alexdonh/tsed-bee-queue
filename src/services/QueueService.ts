import {Constant, Inject, OnDestroy, Service} from "@tsed/di";
import {Logger} from "@tsed/logger";
import BeeQueue from "bee-queue";
import {RedisService} from "tsed-redis";
import {QueueOptions, QueueSettings} from "../interfaces";

@Service()
export class QueueService implements OnDestroy {
  private readonly queues: Map<string, BeeQueue> = new Map();

  @Inject()
  readonly logger: Logger;

  @Inject(RedisService)
  readonly redisService: RedisService;

  @Constant("queue", {})
  protected readonly queueSettings: QueueSettings;

  async $onDestroy() {
    await this.close();
  }

  get(name: string, hostId?: string, options?: Partial<QueueOptions>): BeeQueue {
    let queue = this.queues.get(name);
    if (!queue) {
      const {redis, ...settings} = this.queueSettings;
      const redisClient = !redis || typeof redis === "string" ? this.redisService.get(hostId || redis) : undefined;
      queue = new BeeQueue(name, {redis: redisClient, ...settings, ...options});
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
    await Promise.all(Array.from(this.queues, ([, q]) => q.close()));
    this.queues.clear();
  }
}
