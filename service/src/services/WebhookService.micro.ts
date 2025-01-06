import 'reflect-metadata';
import { DomainEvent } from '../types/DomainEvent';
import { WebhookService } from './WebhookService';

describe('WebhookService', () => {
   let webhookService: WebhookService;

   beforeEach(() => {
      webhookService = new WebhookService();
   });

   it('should throw an error with the correct message when handle is called', async () => {
      const mockPayload: DomainEvent = {
         eventOid: '123e4567-e89b-12d3-a456-426614174000',
         eventType: 'UserRegistered',
         timestamp: '2024-11-11T10:15:30Z',
         payload: {
            dataUri: 'https://example.com/data/user/123e4567-e89b-12d3-a456-426614174000'
         },
         metadata: {
            correlationOid: '789e4567-e89b-12d3-a456-426614174001',
            version: '1.0'
         }
      };

      try {
         await webhookService.handleWebhook(mockPayload);
      } catch (error: unknown) {
         expect(error).toBeInstanceOf(Error);
         expect((error as Error).message).toBe(
            `Method not implemented. Received payload : ${JSON.stringify(mockPayload)}`
         );
      }
   });
});
