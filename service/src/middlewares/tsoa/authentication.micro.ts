import * as express from 'express';
import crypto from 'crypto';
import { expressAuthentication } from './authentication';
import { AuthenticationError } from '../../errors/AuthenticationError';
import axios from 'axios';
import jwt from 'jsonwebtoken';

jest.mock('crypto');

jest.mock('env-var', () => ({
   get: jest.fn().mockImplementation((key) => {
      if (key === 'SIGNATURE_SECRET_KEY') {
         return {
            required: () => ({
               asString: () => 'mockedSecretKey'
            })
         };
      }
      return {
         required: () => ({
            asString: () => '',
            asPortNumber: () => 0,
            default: () => ({
               asString: () => '',
               asPortNumber: () => 0
            })
         }),
         default: () => ({
            asString: () => '',
            asPortNumber: () => 0
         })
      };
   })
}));

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('jsonwebtoken', () => ({
   verify: jest.fn()
}));

describe('authentication', () => {
   it('should reject unsupported authentication type', async () => {
      await expect(expressAuthentication({} as express.Request, 'unsupported')).rejects.toThrow(AuthenticationError);
   });

   it('should reject if no x-signature is provided', async () => {
      const request = { headers: {} } as express.Request;
      await expect(expressAuthentication(request, 'xSignatureAuth')).rejects.toThrow('No x-signature provided');
   });

   it('should reject if signature is expired', async () => {
      const timestamp = new Date().getTime() - 600;
      const request = {
         headers: { 'x-signature': `t=${timestamp},v1=hash` },
         body: {}
      } as unknown as express.Request;
      await expect(expressAuthentication(request, 'xSignatureAuth')).rejects.toThrow('Signature is expired');
   });

   it('should reject if signature verification failed', async () => {
      const timestamp = Date.now().toString();
      const request = {
         headers: { 'x-signature': `t=${timestamp},v1=wronghash` },
         body: {}
      } as unknown as express.Request;
      (crypto.createHmac as jest.Mock).mockReturnValue({
         update: jest.fn().mockReturnThis(),
         digest: jest.fn().mockReturnValue('correcthash')
      });
      await expect(expressAuthentication(request, 'xSignatureAuth')).rejects.toThrow('Signature verification failed');
   });

   it('should resolve if signature verification succeeded', async () => {
      const timestamp = Date.now().toString();
      const request = {
         headers: { 'x-signature': `t=${timestamp},v1=correcthash` },
         body: {}
      } as unknown as express.Request;
      (crypto.createHmac as jest.Mock).mockReturnValue({
         update: jest.fn().mockReturnThis(),
         digest: jest.fn().mockReturnValue('correcthash')
      });
      await expect(expressAuthentication(request, 'xSignatureAuth')).resolves.toBe(true);
   });

   it('should reject if no authorization header is provided', async () => {
      const request = { headers: {} } as express.Request;
      const publicKey = 'publicKey';
      mockedAxios.get.mockResolvedValue({ data: publicKey });
      await expect(expressAuthentication(request, 'jwt')).rejects.toThrow('No authorization header provided');
   });

   it('should reject if token verification fails', async () => {
      const request = { headers: { authorization: 'Bearer invalidtoken' } } as express.Request;
      const publicKey = 'publicKey';
      mockedAxios.get.mockResolvedValue({ data: publicKey });
      (jwt.verify as jest.Mock).mockImplementation(() => {
         throw new Error('Invalid token');
      });
      await expect(expressAuthentication(request, 'jwt')).rejects.toThrow('Invalid token');
   });

   it('should resolve if token verification succeeds', async () => {
      const request = { headers: { authorization: 'Bearer validtoken' } } as express.Request;
      const publicKey = 'publicKey';
      mockedAxios.get.mockResolvedValue({ data: publicKey });
      (jwt.verify as jest.Mock).mockReturnValue({ userId: '123' });
      await expect(expressAuthentication(request, 'jwt')).resolves.toEqual(true);
   });
});
