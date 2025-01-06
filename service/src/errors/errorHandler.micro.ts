import { Request as ExRequest, Response as ExResponse, NextFunction } from 'express';
import { AuthenticationError } from './AuthenticationError';
import { errorHandler } from './errorHandler';
import { ValidateError } from '@tsoa/runtime';

describe('ErrorHandler', () => {
   let req: ExRequest;
   let res: ExResponse;
   let next: NextFunction;

   beforeEach(() => {
      req = {} as ExRequest;
      res = {
         status: jest.fn().mockReturnThis(),
         send: jest.fn().mockReturnThis()
      } as unknown as ExResponse;
      next = jest.fn();
   });

   it('should handle ValidateError', () => {
      const error = new ValidateError({}, 'Validation failed');
      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.send).toHaveBeenCalledWith({ details: error.fields });
   });

   it('should handle AuthenticationError', () => {
      const error = new AuthenticationError('Authentication failed');
      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith({ message: 'Authentication failed' });
   });

   it('should handle generic Error', () => {
      const error = new Error('Generic error');
      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ message: error.message });
   });

   it('should call next for unknown error types', () => {
      const error = 'Unknown error';
      errorHandler(error, req, res, next);

      expect(next).toHaveBeenCalled();
   });
});
