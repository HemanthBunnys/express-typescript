import { Request, Response, NextFunction } from 'express';
import { AppError } from '../domain/errors.js';
import { getDefaultLogger, Logger } from '../utils/logger.js';

export function createServiceErrorHandler(logger: Logger = getDefaultLogger()) {
  return (error: Error, req: Request, res: Response, next: NextFunction): void => {

    if (error instanceof AppError) {
      logger.error(`Service error: ${error.message}`, error, {
        errorCode: error.code,
        httpStatus: error.httpStatus,
        details: error.details
      });
    } else {
      logger.error(`Unexpected service error: ${error.message}`);
    }
    next(error);
  };
}

// Async handler wrapper to catch async errors
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}