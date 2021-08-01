import {Inject, Service, Value} from "@tsed/di";
import {Logger} from "@tsed/logger";
import BeeQueue, {QueueSettings} from "bee-queue";
import {RedisClient} from "redis";

@Service()
export class QueueService {
  private readonly queues: Map<string, BeeQueue> = new Map();

  @Inject()
  readonly logger: Logger;

  @Inject(RedisClient)
  readonly redis: RedisClient;

  @Value("queue")
  protected readonly queueSettings?: QueueSettings;

  get(name: string): BeeQueue {
    let queue = this.queues.get(name);
    if (!queue) {
      const settings = this.queueSettings || {};
      if (!settings.redis) {
        settings.redis = this.redis;
      }
      queue = new BeeQueue(name, settings);
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
