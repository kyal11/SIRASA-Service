import { Module, Global } from '@nestjs/common';
import { Redis } from 'ioredis';
import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async () => {
        const redis = new Redis({
          host: process.env.REDIS_HOST,
          port: parseInt(process.env.REDIS_PORT),
        });

        redis.on('error', (err) => console.error('Redis error:', err));
        return redis;
      },
    },
    RedisService,
  ],
  exports: ['REDIS_CLIENT', RedisService],
})
export class RedisModule {}
