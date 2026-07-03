export type JobPriority = "critical" | "high" | "normal" | "low";

export interface Job<T = any> {
  id: string;
  type: string;
  data: T;
  priority: JobPriority;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  runAt: Date;
}

type JobHandler<T = any> = (data: T) => Promise<void>;

const PRIORITY_WEIGHT: Record<JobPriority, number> = {
  critical: 0,
  high: 1,
  normal: 2,
  low: 3,
};

class JobQueue {
  private queue: Job[] = [];
  private handlers: Map<string, JobHandler[]> = new Map();
  private processing = false;
  private interval: NodeJS.Timeout | null = null;

  register<T>(type: string, handler: JobHandler<T>): void {
    const handlers = this.handlers.get(type) || [];
    handlers.push(handler as JobHandler);
    this.handlers.set(type, handlers);
  }

  add<T>(
    type: string,
    data: T,
    opts: { priority?: JobPriority; delay?: number; maxAttempts?: number } = {}
  ): string {
    const job: Job<T> = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      data,
      priority: opts.priority || "normal",
      attempts: 0,
      maxAttempts: opts.maxAttempts || 3,
      createdAt: new Date(),
      runAt: new Date(Date.now() + (opts.delay || 0)),
    };

    this.queue.push(job);
    this.queue.sort((a, b) => {
      const pw = PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
      if (pw !== 0) return pw;
      return a.runAt.getTime() - b.runAt.getTime();
    });

    return job.id;
  }

  private async processNext(): Promise<void> {
    if (this.processing) return;

    const now = Date.now();
    const job = this.queue.find((j) => j.runAt.getTime() <= now);
    if (!job) return;

    this.processing = true;
    this.queue = this.queue.filter((j) => j.id !== job.id);

    const handlers = this.handlers.get(job.type) || [];
    job.attempts++;

    try {
      for (const handler of handlers) {
        await handler(job.data);
      }
    } catch (err) {
      console.error(`[Queue] Job ${job.type} failed (attempt ${job.attempts}):`, err);
      if (job.attempts < job.maxAttempts) {
        job.runAt = new Date(Date.now() + job.attempts * 5000);
        this.queue.push(job);
      } else {
        console.error(`[Queue] Job ${job.id} permanently failed after ${job.maxAttempts} attempts`);
      }
    } finally {
      this.processing = false;
    }
  }

  start(intervalMs: number = 2000): void {
    if (this.interval) return;
    this.interval = setInterval(() => {
      this.processNext().catch((err) =>
        console.error("[Queue] Processing error:", err)
      );
    }, intervalMs);
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  get size(): number {
    return this.queue.length;
  }

  get pending(): { type: string; priority: JobPriority; attempts: number }[] {
    return this.queue.map((j) => ({
      type: j.type,
      priority: j.priority,
      attempts: j.attempts,
    }));
  }
}

declare global {
  var _jobQueue: JobQueue | undefined;
}

export const queue = global._jobQueue || (global._jobQueue = new JobQueue());
queue.start();
