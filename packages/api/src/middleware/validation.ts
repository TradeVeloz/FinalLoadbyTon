import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const issues = (result.error as ZodError).issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      }));
      return res.status(422).json({ error: 'Validation failed', issues });
    }
    (req as Request & Record<string, unknown>)[source] = result.data;
    next();
  };
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
}
