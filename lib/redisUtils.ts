import Redis from 'ioredis';
import { redis } from './redis';

declare global {
  // eslint-disable-next-line no-var
  var redisUtils: RedisUtils | undefined;
}

// This is a stripped down version of the RedisUtils class that is used in src/modules/redis/redis.service.ts
class RedisUtils  {
  constructor(
    private readonly redis: Redis
  ) {}

  use(): Redis {
    return this.redis;
  }

  async getAllKeys(): Promise<string[]> {
    return await this.redis.keys('*'); // This will match all keys
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
    waitTime: number;
    waitMinutes: number;
    waitHours: number;
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

const redisUtils = global.redisUtils || new RedisUtils(redis);

// Assign the Redis utils to the global object in development to prevent multiple instances
if (process.env.NODE_ENV !== 'production') global.redisUtils = redisUtils;

export default redisUtils;
