import { Request as ExRequest, Response as ExResponse, NextFunction } from 'express';
import { AuthenticationError } from './AuthenticationError';
import { StatusCodes } from 'http-status-codes';
import { ValidateError } from '@tsoa/runtime';

export function errorHandler(err: unknown, _req: ExRequest, res: ExResponse, next: NextFunction): void {
   if (err instanceof ValidateError) {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY);
      res.send({
         details: err.fields
      });
   } else if (err instanceof AuthenticationError) {
      res.status(StatusCodes.UNAUTHORIZED);
      res.send({
         message: 'Authentication failed'
      });
   } else if (err instanceof Error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR);
      res.send({
         message: err.message
      });
   } else {
      next();
   }
}
