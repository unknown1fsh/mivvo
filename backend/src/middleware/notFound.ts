import { Request, Response, NextFunction } from 'express';

export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new Error(`Bulunamadı - ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: error.message,
  });
};
