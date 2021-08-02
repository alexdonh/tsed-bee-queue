export interface QueueOptions {
  name: string;
  concurrency?: number;
  [key: string]: any;
}
