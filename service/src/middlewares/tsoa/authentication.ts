import * as express from 'express';
import crypto from 'crypto';
import { AuthenticationError } from '../../errors/AuthenticationError';
import axios, { AxiosError } from 'axios';
import jwt, { Secret } from 'jsonwebtoken';
import * as environment from '../../Environment';

const signatureSecretKey = environment.signatureSecretKey;

const publicKeyUrl: string = `${environment.idpUrl}/realms/macroactive`;

// eslint-disable-next-line
export function expressAuthentication(request: express.Request, securityName: string, roles?: string[]): Promise<any> {
   switch (securityName) {
      case 'xSignatureAuth':
         return signatureVerification(request);
      case 'jwt':
         return jwtAuth(request);
      default:
         return Promise.reject(new AuthenticationError('Unsupported authentication type'));
   }
}

async function signatureVerification(request: express.Request) {
   const xSignature = request.headers['x-signature'] as string;
   if (!xSignature) {
      return Promise.reject(new AuthenticationError('No x-signature provided'));
   }

   const [timeString, hashString] = xSignature.split(',');
   const timestamp = timeString.split('=')[1];
   const now = new Date().getTime();
   const diff = now - parseInt(timestamp, 10);

   if (diff > 300) {
      // 300 seconds
      return Promise.reject(new AuthenticationError('Signature is expired'));
   }
   const hashInHeader = hashString.split('=')[1];
   const payload = JSON.stringify(request.body);
   const signedPayload = `t=${timestamp},v1=${payload}`;

   const hash = crypto.createHmac('sha256', signatureSecretKey).update(signedPayload).digest('hex');

   if (hashInHeader === hash) {
      return Promise.resolve(true);
   } else {
      return Promise.reject(new AuthenticationError('Signature verification failed'));
   }
}

async function jwtAuth(request: express.Request) {
   const key = await getPublicKey();
   try {
      const token = await extractToken(request);
      jwt.verify(token, key as Secret);
      return Promise.resolve(true);
   } catch (error) {
      throw new AuthenticationError('Token can not be verified by public key: ' + error);
   }
}

async function getPublicKey(): Promise<string> {
   try {
      const { data } = await axios.get(publicKeyUrl);
      return data;
   } catch (error) {
      if (error instanceof AxiosError) {
         throw new AuthenticationError(`Cannot resolve platform public key: ` + error);
      }
      throw error;
   }
}

function extractToken(request: express.Request): Promise<string> {
   let token = request.headers.authorization ?? '';
   token = token.split(' ')[1];
   if (!token) {
      return Promise.reject(new AuthenticationError('No authorization header provided'));
   }
   return Promise.resolve(token);
}
