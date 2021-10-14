import {DoneCallback, Job} from "bee-queue";

export interface QueueProvider<T = any> {
  $exec<U>(job: Job<T>, done: DoneCallback<U>): void;
  $exec<U>(job: Job<T>): Promise<U>;

  $failed?(job: Job<T>, err: Error): void;

  $succeeded?(job: Job<T>, result: any): void;
}
