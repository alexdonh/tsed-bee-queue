import {DoneCallback, Job} from "bee-queue";

export const QUEUES = Symbol.for("queues");
export type QUEUES = QueueProvider;

export interface QueueProvider<T = any> {
  // $exec<U>(job: Job<T>): Promise<U>;
  // $exec<U>(job: Job<T>, done: DoneCallback<U>): void;
  $exec: (<U = any>(job: Job<T>) => Promise<U>) | (<U = any>(job: Job<T>, done: DoneCallback<U>) => void);

  $failed?(job: Job<T>, err: Error): void;

  $succeeded?(job: Job<T>, result: any): void;
}
