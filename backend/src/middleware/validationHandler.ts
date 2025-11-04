/**
 * Validation Handler Middleware
 * 
 * express-validator validation hatalarını yakalar ve uygun response döndürür
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

/**
 * Validation hatalarını kontrol eder ve varsa hata döndürür
 */
export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Doğrulama hatası',
      errors: errors.array(),
    });
    return;
  }
  
  next();
};

