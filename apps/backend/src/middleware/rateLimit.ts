import rateLimit from 'express-rate-limit';

export function authRateLimiter(windowMs: number, max: number) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip ?? req.headers['x-forwarded-for']?.toString() ?? 'unknown',
    message: { success: false, message: 'Terlalu banyak permintaan. Coba lagi nanti.' },
  });
}
