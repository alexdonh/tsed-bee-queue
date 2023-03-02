import {classOf, Store, Type} from "@tsed/core";
import {Constant, Inject, InjectorService, Module, OnDestroy} from "@tsed/di";
import {Logger} from "@tsed/logger";
import {RedisService} from "tsed-redis";
import {QueueOptions, QueueProvider, QUEUES, QueueSettings} from "./interfaces";
import {QueueService} from "./services/QueueService";

@Module({
  imports: [RedisService]
})
export class QueueModule implements OnDestroy {
  // readonly providers = new Map<string, Provider<any>>();
  readonly queues = new Map<string, QueueProvider>();

  @Inject()
  private readonly queueService: QueueService;

  @Inject()
  readonly logger: Logger;

  @Inject()
  private injector: InjectorService;

  @Constant("queue")
  private readonly settings: QueueSettings;

  $onReady() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore why injector.getProviders and injector.getMany only accept string?
    // this.injector.getProviders(QUEUES).forEach((provider) => this.make(provider));
    this.injector.getMany<QueueProvider>(QUEUES).forEach((instance) => this.make(instance));
  }

  async $onDestroy() {
    this.queues.clear();
  }

  getQueueMetadata(token: Type<any>) {
    const {concurrency, ...rest} = Store.from(token)?.get("queue") as QueueOptions;

    return {
      ...rest,
      concurrency: concurrency || 1
    };
  }

  private make(instance: QueueProvider) {
    const provider = this.injector.getProvider(classOf(instance));
    if (!provider) {
      throw new Error(`Could not get DI provider of instance ${classOf(instance)}.`);
    }
    const metadata = this.getQueueMetadata(provider.useClass);
    if (!metadata.name) {
      return;
    }
    if (this.queues.has(metadata.name)) {
      throw new Error(`The ${metadata.name} queue is already registered. Change your queue name used by the class ${classOf(instance)}.`);
    }

    const {name, hostId, ...options} = metadata;
    const queue = this.queueService.get(name, hostId, options);
    queue.process(metadata.concurrency, instance.$exec.bind(instance));

    if (instance.$failed) {
      queue.on("failed", instance.$failed.bind(instance));
    }

    if (instance.$succeeded) {
      queue.on("succeeded", instance.$succeeded.bind(instance));
    }

    this.queues.set(metadata.name, instance);
  }
}
