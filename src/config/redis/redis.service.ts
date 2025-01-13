import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  async set(key: string, value: any, time?: number): Promise<void> {
    const valueToStore =
      typeof value === 'object' ? JSON.stringify(value) : value;

    if (time) {
      await this.redisClient.set(key, valueToStore, 'EX', time);
    } else {
      await this.redisClient.set(key, valueToStore);
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    const value = await this.redisClient.get(key);

    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value);
    } catch {
      return value as T;
    }
  }

  async delete(key: string): Promise<void> {
    await this.redisClient.del(key);
  }
}
