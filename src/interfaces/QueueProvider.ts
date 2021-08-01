import {Job, DoneCallback} from "bee-queue";

export interface QueueProvider<T = any> {
  $exec<U>(job: Job<T>, done: DoneCallback<U>): void;
  $exec<U>(job: Job<T>): Promise<U>;
}
