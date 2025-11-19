/**
 * Queue Service
 * 
 * BullMQ ile job queue yönetimi.
 * AI analizleri ve diğer uzun süren işlemler için background job processing.
 */

import { Queue, Worker, QueueEvents } from 'bullmq';
import Redis from 'ioredis';
import { getEnv } from '../utils/envValidation';
import { logError, logInfo } from '../utils/logger';

// Redis connection
let redisConnection: Redis | null = null;

/**
 * Redis bağlantısı oluştur
 */
function getRedisConnection(): Redis {
  if (redisConnection) {
    return redisConnection;
  }

  const env = getEnv();
  const redisUrl = env.REDIS_URL || process.env.REDIS_URL;

  if (redisUrl) {
    redisConnection = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
  } else {
    // Local Redis (development)
    redisConnection = new Redis({
      host: 'localhost',
      port: 6379,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
  }

  redisConnection.on('error', (err) => {
    logError('Redis connection error', err);
  });

  redisConnection.on('connect', () => {
    logInfo('Redis connected');
  });

  return redisConnection;
}

/**
 * Queue instance'ları
 */
const queues: Map<string, Queue> = new Map();
const workers: Map<string, Worker> = new Map();
const queueEvents: Map<string, QueueEvents> = new Map();

/**
 * Queue oluştur veya mevcut olanı döndür
 */
export function getQueue(queueName: string): Queue {
  if (queues.has(queueName)) {
    return queues.get(queueName)!;
  }

  const connection = getRedisConnection();
  const queue = new Queue(queueName, {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: {
        age: 24 * 3600, // 24 saat
        count: 1000,
      },
      removeOnFail: {
        age: 7 * 24 * 3600, // 7 gün
      },
    },
  });

  queues.set(queueName, queue);
  return queue;
}

/**
 * Worker oluştur
 */
export function createWorker<T = any>(
  queueName: string,
  processor: (job: { data: T }) => Promise<any>
): Worker {
  if (workers.has(queueName)) {
    return workers.get(queueName)!;
  }

  const connection = getRedisConnection();
  const worker = new Worker(
    queueName,
    async (job) => {
      logInfo(`Processing job ${job.id} in queue ${queueName}`, {
        jobId: job.id,
        queueName,
        data: job.data,
      });

      try {
        const result = await processor(job);
        logInfo(`Job ${job.id} completed successfully`, {
          jobId: job.id,
          queueName,
        });
        return result;
      } catch (error) {
        logError(`Job ${job.id} failed`, error, {
          jobId: job.id,
          queueName,
          data: job.data,
        });
        throw error;
      }
    },
    {
      connection,
      concurrency: 5, // Aynı anda 5 job işle
      limiter: {
        max: 10,
        duration: 1000, // Saniyede maksimum 10 job
      },
    }
  );

  worker.on('completed', (job) => {
    logInfo(`Job ${job.id} completed`, { jobId: job.id, queueName });
  });

  worker.on('failed', (job, err) => {
    logError(`Job ${job?.id} failed`, err, { jobId: job?.id, queueName });
  });

  workers.set(queueName, worker);
  return worker;
}

/**
 * Queue Events oluştur (monitoring için)
 */
export function getQueueEvents(queueName: string): QueueEvents {
  if (queueEvents.has(queueName)) {
    return queueEvents.get(queueName)!;
  }

  const connection = getRedisConnection();
  const events = new QueueEvents(queueName, { connection });
  queueEvents.set(queueName, events);
  return events;
}

/**
 * Job ekle
 */
export async function addJob<T = any>(
  queueName: string,
  jobName: string,
  data: T,
  options?: {
    priority?: number;
    delay?: number;
    jobId?: string;
  }
): Promise<string> {
  const queue = getQueue(queueName);
  const job = await queue.add(jobName, data, {
    priority: options?.priority,
    delay: options?.delay,
    jobId: options?.jobId,
  });

  logInfo(`Job added to queue ${queueName}`, {
    jobId: job.id,
    queueName,
    jobName,
  });

  return job.id!;
}

/**
 * Queue'yu kapat
 */
export async function closeQueue(queueName: string): Promise<void> {
  const queue = queues.get(queueName);
  if (queue) {
    await queue.close();
    queues.delete(queueName);
  }

  const worker = workers.get(queueName);
  if (worker) {
    await worker.close();
    workers.delete(queueName);
  }

  const events = queueEvents.get(queueName);
  if (events) {
    await events.close();
    queueEvents.delete(queueName);
  }
}

/**
 * Tüm queue'ları kapat
 */
export async function closeAllQueues(): Promise<void> {
  const queueNames = Array.from(queues.keys());
  await Promise.all(queueNames.map((name) => closeQueue(name)));

  if (redisConnection) {
    await redisConnection.quit();
    redisConnection = null;
  }
}

/**
 * Queue istatistikleri
 */
export async function getQueueStats(queueName: string): Promise<{
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}> {
  const queue = getQueue(queueName);
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
  };
}

