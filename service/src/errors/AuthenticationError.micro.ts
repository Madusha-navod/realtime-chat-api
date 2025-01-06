import { AuthenticationError } from './AuthenticationError';

describe('AuthenticationError', () => {
   it('should create an instance with the correct message and name', () => {
      const message = 'Authentication error';
      const error = new AuthenticationError(message);

      expect(error).toBeInstanceOf(AuthenticationError);
      expect(error.message).toBe(message);
      expect(error.name).toBe('AuthenticationError');
   });

   it('should set the stack trace if originalError is provided', () => {
      const message = 'Authentication error';
      const originalError = 'Original stack trace';
      const error = new AuthenticationError(message, originalError);

      expect(error.stack).toBe(originalError);
   });

   it('should not set the stack trace if originalError is not provided', () => {
      const message = 'Authentication error';
      const error = new AuthenticationError(message);

      expect(error.stack).not.toBe('Original stack trace');
   });

   it('should set the prototype correctly', () => {
      const message = 'Authentication error';
      const error = new AuthenticationError(message);

      expect(Object.getPrototypeOf(error)).toBe(AuthenticationError.prototype);
   });
});
