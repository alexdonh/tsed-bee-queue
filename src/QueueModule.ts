import {OnReady} from "@tsed/common";
import {classOf, Store, Type} from "@tsed/core";
import {Inject, InjectorService, Module, OnDestroy, Provider} from "@tsed/di";
import {Logger} from "@tsed/logger";
import {RedisService} from "tsed-redis";
import {QueueOptions, QueueProvider} from "./interfaces";
import {PROVIDER_TYPE_QUEUE} from "./registries/QueueRegistry";
import {QueueService} from "./services/QueueService";

@Module({
  imports: [RedisService]
})
export class QueueModule implements OnReady, OnDestroy {
  readonly providers = new Map<string, Provider<any>>();

  @Inject()
  protected readonly queueService: QueueService;

  @Inject()
  readonly logger: Logger;

  @Inject()
  protected injector: InjectorService;

  $onReady(): Promise<any> | void {
    this.injector.getProviders(PROVIDER_TYPE_QUEUE).forEach((provider) => this.make(provider));
  }

  $onDestroy(): Promise<any> | void {
    return this.queueService.close().then(() => {
      this.providers.clear();
    });
  }

  getQueueMetadata(token: Type<any>) {
    const {concurrency, ...rest} = Store.from(token)?.get("queue") as QueueOptions;

    return {
      ...rest,
      concurrency: concurrency || 1
    };
  }

  private make(provider: Provider<any>) {
    const metadata = this.getQueueMetadata(provider.useClass);
    if (metadata.name) {
      if (this.providers.has(metadata.name)) {
        throw Error(
          `The ${metadata.name} queue is already registered. Change your queue name used by the class ${classOf(provider.useClass)}.`
        );
      }

      const instance = this.injector.get<QueueProvider>(provider.token);
      if (!instance) {
        throw Error(`Cannot get instance ${provider.token}.`);
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

      provider.queue = queue;

      this.providers.set(metadata.name, provider);
    }
  }
}
