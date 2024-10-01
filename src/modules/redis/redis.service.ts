import { InjectRedis } from '@nestjs-modules/ioredis';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import Redis, { Redis as RedisClient } from 'ioredis';
import { REDIS_HOST, REDIS_PORT } from '../../config/config.env';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly verboseLogging = false;
  private logger = new Logger(RedisService.name);
  private pubSubClient: RedisClient;
  private expirationListener: ((expiredKey: string) => void)[] = [];

  constructor(@InjectRedis() private readonly redis: Redis) {
    // Create a new Redis connection for subscribing to events, as the main connection cannot be used for other commands while subscribed
    this.pubSubClient = new Redis({
      host: REDIS_HOST,
      port: REDIS_PORT,
    });
  }

  async onModuleInit() {
    // Enable keyspace notifications
    await this.redis.config('SET', 'notify-keyspace-events', 'AKEx');

    // Subscribe to all keyspace events
    this.pubSubClient.psubscribe('__keyspace@0__:*', (err, count) => {
      if (err) {
        this.logger.error('Failed to subscribe to keyspace events', err);
        return;
      }
      this.logger.log(`Subscribed to ${count} keyspace event channels.`);
    });

    // Handle incoming keyspace events
    this.pubSubClient.on('pmessage', (pattern, channel, message) => {
      // `channel` will look something like '__keyspace@0__:mykey'
      const key = channel.slice(channel.indexOf(':') + 1);

      if (this.verboseLogging) {
        if (message === 'set') {
          this.logger.log(`Key set: ${key}`);
        } else if (message === 'expire') {
          this.logger.log(`Key expire: ${key}`);
        } else if (message === 'expired') {
          this.logger.log(`Key expired: ${key}`);
        } else if (message === 'del') {
          this.logger.log(`Key del: ${key}`);
        }
      }
      if (message === 'expired') {
        this.expirationListener.forEach((cb) => cb(key));
      }
    });

    if (this.verboseLogging) {
      for await (const key of this.generateAllKeys()) {
        /// Process each key here
        this.logger.log(`Existing Key: ${key}`);
      }
    }
  }

  async onModuleDestroy() {
    // Unsubscribe from expired events and close the pub/sub client connection when the module is destroyed
    await this.pubSubClient.punsubscribe('__keyspace@0__:*');
    await this.pubSubClient.quit();
  }

  use(): Redis {
    return this.redis;
  }

  async getAllKeys(): Promise<string[]> {
    return await this.redis.keys('*'); // This will match all keys
  }

  /*
    /// Example Usage
     redisService = new RedisService();

    async processKeys() {
        for await (const key of this.redisService.generateAllKeys()) {
            /// Process each key here
            console.log(key);
        }
    }
   */
  async *generateAllKeys() {
    let cursor = '0';

    do {
      // Use the SCAN command with the current cursor
      const reply: [string, string[]] = await this.redis.scan(
        cursor,
        'MATCH',
        '*',
        'COUNT',
        100,
      );
      cursor = reply[0]; // Update the cursor to the next cursor value

      // Yield each key found in this batch
      for (const key of reply[1]) {
        yield key;
      }
    } while (cursor !== '0'); // Continue until the cursor returns to 0
  }

  async saveToken(token: string, userId: string, ttl: number) {
    // Save the token in Redis
    await this.set(token, userId, ttl);

    // Count the token as a request
    await this.set(`${token}:${userId}`, '1', ttl);
  }

  async deleteToken(key: string) {
    const userId = await this.get(key);
    await this.del(key);
    await this.del(`${key}:${userId}`);
  }

  async deleteTokens(prefix: string, userId: string) {
    const keys = await this.keys(`${prefix}_*:${userId}`);
    for (const key of keys) {
      const token = key.slice(0, key.indexOf(':'));
      await this.deleteToken(token);
    }
  }

  // Look though the keys to determine how long the user has to wait before making another request
  // Or in other words, when does the first key in the array of keys expires first, and how long until then
  async waitTime(keys: string[]): Promise<{
    waitTime: any;
    waitMinutes: any;
    waitHours: any;
  }> {
    let waitTime = 0;
    for (const key of keys) {
      const ttl = await this.ttl(key);
      if (ttl > waitTime) {
        waitTime = ttl;
      }
    }

    const waitHours = Math.floor(waitTime / 60 / 60);
    const waitMinutes = Math.ceil((waitTime / 60) % 60);

    return {
      waitTime,
      waitMinutes,
      waitHours,
    };
  }

  /// Subscribe to key expiration events
  /// @param cb - Callback function to be called when a key expires
  /// @returns Function to unsubscribe from the event
  async subscribeToExpirationEvents(
    cb: (expiredKey: string) => void,
  ): Promise<() => void> {
    this.expirationListener.push(cb);
    return () => {
      this.expirationListener = this.expirationListener.filter(
        (listener) => listener !== cb,
      );
    };
  }

  async getOrSetCache<T>(
    key: string,
    cb: () => Promise<T>,
    seconds: number,
  ): Promise<T> {
    const value = await this.get(key);
    if (value) {
      return JSON.parse(value);
    }

    const result = await cb();
    await this.set(key, JSON.stringify(result), seconds);
    return result;
  }

  async ping(): Promise<string> {
    return await this.redis.ping();
  }

  async get(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }

  async set(key: string, value: string, seconds?: number): Promise<void> {
    if (seconds) {
      await this.redis.setex(key, seconds, value);
      return;
    }
    await this.redis.set(key, value);
  }

  async getset(key: string, value: string): Promise<string | null> {
    return await this.redis.getset(key, value);
  }

  async setnx(key: string, value: string | number | Buffer): Promise<number> {
    return await this.redis.setnx(key, value);
  }

  async incr(key: string, initialValue = 0, ttl?: number): Promise<number> {
    if ((await this.exists(key)) === 0) {
      await this.setnx(key, initialValue);
    }
    const result = await this.redis.incr(key);
    if (ttl) {
      await this.expire(key, ttl);
    }
    return result;
  }

  async decr(key: string, initialValue = 0, ttl?: number): Promise<number> {
    if ((await this.exists(key)) === 0) {
      await this.redis.setnx(key, initialValue);
    }
    const result = await this.redis.decr(key);
    if (ttl) {
      await this.expire(key, ttl);
    }
    return result;
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async exists(key: string): Promise<number> {
    return await this.redis.exists(key);
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.redis.expire(key, seconds);
  }

  async ttl(key: string): Promise<number> {
    return await this.redis.ttl(key);
  }

  async keys(pattern: string): Promise<string[]> {
    return await this.redis.keys(pattern);
  }

  async flushall(): Promise<void> {
    await this.redis.flushall();
  }

  async flushdb(): Promise<void> {
    await this.redis.flushdb();
  }
}
