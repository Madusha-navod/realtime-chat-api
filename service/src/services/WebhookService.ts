import { injectable } from 'inversify';
import { IWebhookService } from './IWebhookService';
import { DomainEvent } from '../types/DomainEvent';
import { Logger } from '../configs/Logger';

@injectable()
export class WebhookService implements IWebhookService {
   public async handleWebhook(payload: DomainEvent): Promise<void> {
      Logger.info('Method not implemented. Received payload : ' + JSON.stringify(payload));
   }
}
