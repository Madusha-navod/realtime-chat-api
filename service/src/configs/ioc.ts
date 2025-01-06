import 'reflect-metadata';
import { Controller } from '@tsoa/runtime';
import { Container, decorate, injectable } from 'inversify';
import { buildProviderModule } from 'inversify-binding-decorators';
import { Types } from './ioc.types';
import { IApp } from '../IApp';
import { App } from '../App';
import { IWebhookService } from '../services/IWebhookService';
import { WebhookService } from '../services/WebhookService';

const iocContainer = new Container({ skipBaseClassChecks: true });

decorate(injectable(), Controller);

// In alphabetical order, do not add Controllers here:
iocContainer.bind<IApp>(Types.IApp).to(App);
iocContainer.bind<IWebhookService>(Types.IWebhookService).to(WebhookService);
iocContainer.bind<string>(Types.NatsConnectionString).toConstantValue(process.env.NATS_CONNECTION_STRING || 'localhost:4222');
iocContainer.load(buildProviderModule());

export { iocContainer };
