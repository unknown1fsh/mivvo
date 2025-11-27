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

const REDIS_CONNECTION_MAX_ATTEMPTS = parsePositiveInt(process.env.REDIS_CONNECTION_MAX_ATTEMPTS, 3);
const REDIS_CONNECTION_RETRY_DELAY_MS = parsePositiveInt(process.env.REDIS_CONNECTION_RETRY_DELAY_MS, 500);
const REDIS_CONNECTION_TIMEOUT_MS = parsePositiveInt(process.env.REDIS_CONNECTION_TIMEOUT_MS, 4000);
const LOCAL_REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const LOCAL_REDIS_PORT = parsePositiveInt(process.env.REDIS_PORT, 6379);
const redisPassword = process.env.REDIS_PASSWORD?.trim() || undefined;

let redisConnection: Redis | null = null;
let redisConnectionPromise: Promise<Redis | null> | null = null;
let redisUnavailable = false;

const queues: Map<string, Queue> = new Map();
const workers: Map<string, Worker> = new Map();
const queueEvents: Map<string, QueueEvents> = new Map();

async function getRedisConnection(): Promise<Redis | null> {
  if (redisUnavailable) {
    return null;
  }

  if (redisConnection) {
    return redisConnection;
  }

  if (redisConnectionPromise) {
    return redisConnectionPromise;
  }

  redisConnectionPromise = (async () => {
    const env = getEnv();
    const redisUrl = env.REDIS_URL || process.env.REDIS_URL;
    const isProduction = process.env.NODE_ENV === 'production';

    if (redisUrl) {
      return connectWithRetries(() => buildUrlClient(redisUrl), 'Redis URL');
    }

    if (!isProduction) {
      logInfo('REDIS_URL not found, attempting local Redis (localhost:6379)');
      return connectWithRetries(buildLocalClient, 'local Redis');
    }

    const err = new Error('REDIS_URL is required in production');
    logError('Redis URL not found in production environment. Queue service will be disabled.', err);
    console.warn('⚠️  REDIS_URL is not set in production. Queue workers will not start.');
    console.warn('💡 To fix this in Railway:');
    console.warn('   1. Add a Redis service to your Railway project');
    console.warn('   2. Railway will automatically set REDIS_URL environment variable');
    console.warn('   3. Redeploy your service');
    return null;
  })();

  try {
    const connection = await redisConnectionPromise;
    redisConnectionPromise = null;
    if (!connection) {
      redisUnavailable = true;
      return null;
    }
    redisConnection = connection;
    return connection;
  } catch (error) {
    redisUnavailable = true;
    redisConnectionPromise = null;
    logError('Redis initialization failed', error);
    return null;
  }
}

function buildBaseOptions(): any {
  return {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true,
    retryStrategy: (times: number) => Math.min(times * 50, 2000),
    connectTimeout: REDIS_CONNECTION_TIMEOUT_MS,
    password: redisPassword,
  };
}

function buildUrlClient(redisUrl: string): Redis {
  return new Redis(redisUrl, {
    ...buildBaseOptions(),
  });
}

function buildLocalClient(): Redis {
  return new Redis({
    ...buildBaseOptions(),
    host: LOCAL_REDIS_HOST,
    port: LOCAL_REDIS_PORT,
  });
}

async function connectWithRetries(factory: () => Redis, label: string): Promise<Redis> {
  for (let attempt = 1; attempt <= REDIS_CONNECTION_MAX_ATTEMPTS; attempt++) {
    const client = factory();

    try {
      await withTimeout(client.connect(), REDIS_CONNECTION_TIMEOUT_MS, `${label} connect`);
      await withTimeout(client.ping(), REDIS_CONNECTION_TIMEOUT_MS, `${label} ping`);
      registerRedisHandlers(client, label);
      return client;
    } catch (error) {
      await safeDisconnect(client);
      const err = error instanceof Error ? error : new Error('Unknown Redis error');
      logError(`[Redis] ${label} connection attempt ${attempt} failed`, err);

      if (attempt === REDIS_CONNECTION_MAX_ATTEMPTS) {
        throw err;
      }

      await delay(REDIS_CONNECTION_RETRY_DELAY_MS);
    }
  }

  throw new Error(`[Redis] ${label} connection retries exhausted`);
}

function registerRedisHandlers(connection: Redis, label: string): void {
  connection.on('error', (err) => {
    logError(`Redis connection error (${label})`, err);
  });

  connection.on('connect', () => {
    logInfo(`Redis connected (${label})`);
  });
}

async function safeDisconnect(connection: Redis): Promise<void> {
  try {
    await connection.quit();
  } catch {
    connection.disconnect();
  }
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, reason: string): Promise<T> {
  let timeoutId: NodeJS.Timeout | null = null;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`${reason} timed out after ${timeoutMs}ms`)), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }
  return fallback;
}

/**
 * Queue oluştur veya mevcut olanı döndür
 */
export async function getQueue(queueName: string): Promise<Queue | null> {
  const connection = await getRedisConnection();

  if (!connection) {
    logError(`Cannot create queue ${queueName}: Redis connection not available`, new Error('Redis connection is null'));
    return null;
  }

  if (queues.has(queueName)) {
    return queues.get(queueName)!;
  }

  const queue = new Queue(queueName, {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: {
        age: 24 * 3600,
        count: 1000,
      },
      removeOnFail: {
        age: 7 * 24 * 3600,
      },
    },
  });

  queues.set(queueName, queue);
  return queue;
}

/**
 * Worker oluştur
 */
export async function createWorker<T = any>(
  queueName: string,
  processor: (job: { data: T }) => Promise<any>
): Promise<Worker | null> {
  const connection = await getRedisConnection();

  if (!connection) {
    logError(`Cannot create worker for queue ${queueName}: Redis connection not available`, new Error('Redis connection is null'));
    return null;
  }

  if (workers.has(queueName)) {
    return workers.get(queueName)!;
  }

  try {
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
        concurrency: 5,
        limiter: {
          max: 10,
          duration: 1000,
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
  } catch (error) {
    logError(`Worker for queue ${queueName} could not be created`, error);
    return null;
  }
}

/**
 * Queue Events oluştur (monitoring için)
 */
export async function getQueueEvents(queueName: string): Promise<QueueEvents | null> {
  const connection = await getRedisConnection();

  if (!connection) {
    logError(`Cannot create queue events for ${queueName}: Redis connection not available`, new Error('Redis connection is null'));
    return null;
  }

  if (queueEvents.has(queueName)) {
    return queueEvents.get(queueName)!;
  }

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
): Promise<string | null> {
  const queue = await getQueue(queueName);

  if (!queue) {
    logError(`Cannot add job to queue ${queueName}: Redis connection not available`, new Error('Queue is null'));
    return null;
  }

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
} | null> {
  const queue = await getQueue(queueName);

  if (!queue) {
    logError(`Cannot get stats for queue ${queueName}: Redis connection not available`, new Error('Queue is null'));
    return null;
  }

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

