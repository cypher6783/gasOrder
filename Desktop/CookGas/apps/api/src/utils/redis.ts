import Redis from 'ioredis';
import { logger } from './logger';

// Make Redis optional - if REDIS_URL is not provided, Redis features will be disabled
const redis = process.env.REDIS_URL 
  ? new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) {
          logger.warn('⚠️  Redis connection failed after 3 retries. Redis features disabled.');
          return null; // Stop retrying
        }
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      lazyConnect: true, // Don't connect immediately
    })
  : null;

if (redis) {
  redis.connect().catch((err) => {
    logger.warn('⚠️  Redis connection failed. Redis features disabled.', err.message);
  });

  redis.on('connect', () => {
    logger.info('✅ Redis connected');
  });

  redis.on('error', (err) => {
    logger.warn('⚠️  Redis error (non-critical):', err.message);
  });
} else {
  logger.info('ℹ️  Redis not configured. Redis features disabled.');
}

export default redis;
