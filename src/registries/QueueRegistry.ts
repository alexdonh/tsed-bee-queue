import {GlobalProviders, Provider} from "@tsed/di";

export const PROVIDER_TYPE_QUEUE = "queue";

export const QueueRegistry = GlobalProviders.createRegistry(PROVIDER_TYPE_QUEUE, Provider, {
  injectable: true
});

export const registerQueue = GlobalProviders.createRegisterFn(PROVIDER_TYPE_QUEUE);
