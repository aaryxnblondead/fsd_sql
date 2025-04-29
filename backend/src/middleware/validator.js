import { validationResult } from 'express-validator';
import { ApiError } from './errorHandler.js';

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorsArray = errors.array();
    const errorMessage = errorsArray.map(error => error.msg).join(', ');
    return next(new ApiError(400, errorMessage));
  }
  
  next();
}; 