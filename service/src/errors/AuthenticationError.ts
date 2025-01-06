export class AuthenticationError extends Error {
   constructor(message: string, originalError?: string) {
      super(message);
      this.name = 'AuthenticationError';
      if (originalError) {
         this.stack = originalError;
      }
      Object.setPrototypeOf(this, AuthenticationError.prototype);
   }
}
