import rateLimit from 'express-rate-limit';
import redis from '../utils/redis';

export const createRateLimiter = (windowMs: number, max: number) => {
  return rateLimit({
    windowMs,
    max,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    // Use Redis for distributed rate limiting
    store: {
      async increment(key: string) {
        const current = await redis.incr(key);
        if (current === 1) {
          await redis.expire(key, Math.ceil(windowMs / 1000));
        }
        return {
          totalHits: current,
          resetTime: new Date(Date.now() + windowMs),
        };
      },
      async decrement(key: string) {
        await redis.decr(key);
      },
      async resetKey(key: string) {
        await redis.del(key);
      },
    },
  });
};

// Specific rate limiters
// Increased limits for development - adjust for production
export const authLimiter = createRateLimiter(15 * 60 * 1000, 100); // 100 requests per 15 minutes (was 5)
export const apiLimiter = createRateLimiter(15 * 60 * 1000, 1000); // 1000 requests per 15 minutes (was 100)
