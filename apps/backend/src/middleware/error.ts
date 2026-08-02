import type { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  errors?: Record<string, string[]>;
}

export function errorHandler(
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  res.status(err.statusCode ?? 500).json({
    success: false,
    message: err.message ?? 'Internal server error',
    errors: err.errors,
  });
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ success: false, message: 'Resource not found.' });
}

export function parseErrors(err: unknown): Record<string, string[]> | undefined {
  if (err instanceof Error && 'issues' in err) {
    const issues = (err as { issues: { path: string[]; message: string }[] }).issues;
    return Object.fromEntries(issues.map(i => [i.path.join('.'), [i.message]]));
  }
  return undefined;
}
