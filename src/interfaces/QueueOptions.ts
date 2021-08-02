export interface QueueOptions {
  name: string;
  hostId?: string; // redis connection
  concurrency?: number;
  [key: string]: any;
}
