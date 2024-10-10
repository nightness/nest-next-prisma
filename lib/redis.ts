// /lib/redis.ts
import Redis from 'ioredis';

declare global {
  // eslint-disable-next-line no-var
  var redisClient: Redis | undefined;
}

export const redis =
  global.redisClient ||
  new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    // Optional: Add any other Redis options here
  });

// Assign the Redis client to the global object in development to prevent multiple instances
if (process.env.NODE_ENV !== 'production') global.redisClient = redis;
