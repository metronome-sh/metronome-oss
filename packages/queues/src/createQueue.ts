import { BaseJobOptions, Job, Queue, QueueEvents, Processor, Worker } from 'bullmq';

import { ioredis as connection } from './ioredis';

export function createQueue<T extends object, R = unknown>(
  name: string,
  defaultJobOptions?: BaseJobOptions,
) {
  const worker = (processor: Processor<T, R>, concurrency: number = 10) => {
    const workerInstance = new Worker<T>(name, processor, {
      connection,
      concurrency,
    });

    workerInstance.on('completed', ({ id, returnvalue }) => {
      console.log(`[${name}:${id}] completed`, typeof returnvalue == 'string' ? returnvalue : '');
    });

    workerInstance.on('failed', (job) => {
      if (!job) {
        console.log(`[${name}] Failed with unknown reason`);
        return;
      }

      const { id, failedReason } = job;

      console.log(`[${name}:${id}] Failed with reason ${failedReason}`);
    });

    console.log(`[${name}] Worker started with concurrency ${concurrency}`);

    // TODO use https://github.com/winstonjs/winston
    return workerInstance;
  };

  const queue = new Queue<T, R>(name, { connection, defaultJobOptions });

  const events = new QueueEvents(name, { connection });

  function add(
    data: Parameters<typeof queue.add>[1] = {} as T,
    opts?: Parameters<typeof queue.add>[2],
  ) {
    return queue.add(name, data, opts);
  }

  /**
   * Touch the queue to trigger it without data
   */
  function touch(jobId?: string) {
    return queue.add(name, {} as T, { jobId: jobId ?? name });
  }

  function get(jobId: string) {
    return queue.getJob(jobId);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const $inferJob: Job<T> = {} as any;

  const $inferReturn: R = {} as R;

  const $inferCompletedEventArgs = [] as unknown as [
    args: {
      jobId: string;
      returnvalue: R;
      prev?: string;
    },
    id: string,
  ];

  return {
    worker,
    add,
    touch,
    get,
    events,
    $inferJob,
    $inferReturn,
    $inferCompletedEventArgs,
  };
}
