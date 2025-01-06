import { StatusCodes } from 'http-status-codes';
import { provide } from 'inversify-binding-decorators';
import { inject } from 'inversify';
import { Types } from '../configs/ioc.types';
import { IWebhookService } from '../services/IWebhookService';
import { DomainEvent } from '../types/DomainEvent';
import { Body, Controller, Post, Route, Security, SuccessResponse } from '@tsoa/runtime';
import { Logger } from '../configs/Logger';

@provide(WebhookController)
@Route('/2024-11-05/event')
@Security('xSignatureAuth')
export class WebhookController extends Controller {
   constructor(
      @inject(Types.IWebhookService)
      private webhookService: IWebhookService
   ) {
      super();
   }

   @SuccessResponse(StatusCodes.OK, 'Ok')
   @Post()
   public async handleWebhook(@Body() domainEvent: DomainEvent): Promise<void> {
      await this.webhookService.handleWebhook(domainEvent);
      this.setStatus(StatusCodes.OK);
      Logger.info(`loc 240618-1640: Webhook received. Request body: ${JSON.stringify(domainEvent)}`);
   }
}
