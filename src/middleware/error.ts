import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../util/ApiError';

//Error Handling Middleware
export const errorHandler = (error: ApiError, req: Request, res: Response, next: NextFunction): void => {
  try {
    const statusCode: number = error.statusCode || 500;
    const message: string = error.message || 'Something went wrong';

    res.status(statusCode).json({ message });
  } catch (error) {
    next(error);
  }
};
