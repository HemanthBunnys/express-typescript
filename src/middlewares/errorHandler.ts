import { Request, Response, NextFunction } from 'express';
import { AppError } from '../domain/errors.js';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof AppError) {
    res.status(error.httpStatus).json({
      code: error.code,
      message: error.message,
      details: error.details
    });
    return;
  }

  // Unexpected errors
  console.error('Unexpected error:', error);
  res.status(500).json({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred'
  });
}