# tsed-bee-queue

Bee-queue for Ts.ED framework

## Goals

This provides Redis-based job queueing services built on top of Bee-queue in Ts.ED framework. With some little configuraitons you can have your web service running as a queue system that handle different jobs as you define.

## Installation

```bash
npm install https://github.com/alexdonh/tsed-bee-queue.git
// or yarn
yarn add https://github.com/alexdonh/tsed-bee-queue.git
```

## Getting started

Your application code structure could look like this:

```
.
├── ...
├── src -- TypeScript source
│   ├── controllers
│   ├── models
│   ├── queues -- Add this directory to store all of your jobs
│   │   ├── FooQueue.ts
│   │   ├── BarQueue.ts
│   │   └── ...
│   ├── ...
│   ├── index.ts
│   └── Server.ts
├── package.json
├── tsconfig.json 
├── tsconfig.compile.json 
└── ...
```

### Create your jobs

```typescript
import {Inject} from "@tsed/di";
import {Logger} from "@tsed/logger";
import {Job, DoneCallback} from "bee-queue";
import {Queue, QueueProvider} from "tsed-bee-queue";

@Queue({name: "foo", concurrency: 2})
export class FooQueue implements QueueProvider {
  @Inject()
  readonly logger: Logger;

  $exec(job: Job<any>) {
    this.logger.debug(job);
    // do something
    // MUST return Promise
  }
  
  // or
  // $exec(job: Job<any>, done: DoneCallback<any>) {
  //   this.logger.debug(job);
  //   // do something
  //   // call done ONCE
  // }
}

```

### Server configuration

You can do this in different ways, below is an example in `Server.ts`:

```typescript
import {Configuration} from "@tsed/di";
import "tsed-redis"; // Recommended as it use DI factory for Redis client to avoid creating connections
import "tsed-bee-queue";
import providers from "./queues";
...

@Configuration({
  ...
  redis: {
    host: "localhost",
    port: 6379,
    ...
  },
  queue: {
    providers // MUST
  }
})
export class Server {
  ...
}
```

### Usage

To create and send job

```typescript
import {Controller, Get, Inject} from "@tsed/common";
import {QueueService} from "tsed-bee-queue";

@Controller("/foo")
export class FooController {
  @Inject()
  readonly queueService: QueueService;

  @Inject()
  readonly logger: Logger;

  @Get("/new")
  async index() {
    const queue = this.queueService.get("foo"); // name of the job queue
    await queue.createJob({hello: "world"}).save();
  }
}
```

This job will be sent to queue and handled by `FooQueue`. This doesn't have to be in the same application. You can send job from different apps as well.

## Queue monitoring

This library also supports monitoring your queues using `bee-queue/bull-arena`.

### Usage

In `Server.ts`:

```typescript
import {Configuration} from "@tsed/di";
import "tsed-redis";
import "tsed-bee-queue";
import {ArenaMiddleware} from "tsed-bee-queue";

...
@Configuration({
  ...
  queue: {
    providers,
    arenaListenOptions: {
      basePath: "/arena",
      disableListen: true // to run it on your running server or you can set a different host/port to run another separate server
    }
  }
})
export class Server {
  $afterRoutesInit(): void {
    this.app.all("/arena/*", ArenaMiddleware); // route all requests to Arena middleware
  }
}
```

## Todos

- Ts.ED CLI plugin to have some CLI commands to generate jobs and some other tasks
- More instructions to use job events

## Credits

- [Me](https://github.com/alexdonh)
- [Ts.ED](https://github.com/tsedio/tsed) for the awesome Typescript framework
- [bee-queue](https://github.com/bee-queue/bee-queue)
- [bull-arena](https://github.com/bee-queue/bull-arena)
- [Redis for Node.js](https://github.com/NodeRedis/node-redis)

## License

Copyright (c) 2021 Alex Do

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
