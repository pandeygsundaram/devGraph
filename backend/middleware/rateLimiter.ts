import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for message ingestion endpoints
 * Limits: 100 requests per 15 minutes per IP/user
 */
export const messageRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many messages submitted. Please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Use a combination of IP and userId for more accurate rate limiting
  keyGenerator: (req) => {
    const user = (req as any).user;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    // If authenticated, use userId + IP, otherwise just IP
    return user?.id ? `${user.id}-${ip}` : ip;
  },
});

/**
 * Stricter rate limiter for batch ingestion
 * Limits: 20 requests per 15 minutes per user
 */
export const batchRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit to 20 batch requests per windowMs
  message: {
    error: 'Too many batch requests. Please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const user = (req as any).user;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return user?.id ? `batch-${user.id}-${ip}` : `batch-${ip}`;
  },
  skip: (req) => {
    // Skip rate limiting for admins
    const user = (req as any).user;
    return user?.role === 'ADMIN';
  },
});

/**
 * General API rate limiter for all routes
 * Limits: 500 requests per 15 minutes
 */
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per windowMs
  message: {
    error: 'Too many requests from this IP. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip for health checks or specific endpoints
    return req.path === '/health' || req.path === '/api/health';
  },
});

/**
 * Strict rate limiter for authentication endpoints
 * Prevents brute force attacks
 * Limits: 5 attempts per 15 minutes
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    error: 'Too many login attempts. Please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
});
