import type { Request } from 'express';

export function getClientIp(req: Request): string {
  if (!req || !req.headers) return '';
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
    (req.headers['x-real-ip'] as string) ||
    req.socket?.remoteAddress ||
    ''
  );
}

export function getUserAgent(req: Request): string {
  if (!req || !req.headers) return '';
  return (req.headers['user-agent'] as string) || '';
}
