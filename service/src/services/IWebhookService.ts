import { DomainEvent } from '../types/DomainEvent';

export interface IWebhookService {
   handleWebhook(payload: DomainEvent): Promise<void>;
}
