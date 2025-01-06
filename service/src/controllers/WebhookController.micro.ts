import { StatusCodes } from 'http-status-codes';
import { IWebhookService } from '../services/IWebhookService';
import { DomainEvent } from '../types/DomainEvent';
import { WebhookController } from './WebhookController';

describe('WebhookController', () => {
   let webhookController: WebhookController;
   let webhookServiceMock: IWebhookService;

   beforeEach(() => {
      webhookServiceMock = {
         handleWebhook: jest.fn()
      };
      webhookController = new WebhookController(webhookServiceMock);
      jest.clearAllMocks();
   });

   it('should call handleWebhook method of IWebhookService when handleWebhook is called', async () => {
      const mockBody: DomainEvent = {
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

      await webhookController.handleWebhook(mockBody);

      expect(webhookServiceMock.handleWebhook).toHaveBeenCalledWith(mockBody);
      expect(webhookServiceMock.handleWebhook).toHaveBeenCalledTimes(1);
   });

   it('should set the status to OK when the webhook is handled successfully', async () => {
      const mockBody: DomainEvent = {
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
      const setStatusMock = jest.spyOn(webhookController, 'setStatus');

      await webhookController.handleWebhook(mockBody);

      expect(setStatusMock).toHaveBeenCalledWith(StatusCodes.OK);
   });
});
