export interface QueueOptions {
  name: string;
  label?: string;
  concurrency?: number;
  [key: string]: any;
}
