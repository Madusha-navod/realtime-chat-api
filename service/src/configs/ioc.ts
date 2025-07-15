import 'reflect-metadata';
import { Controller } from '@tsoa/runtime';
import { Container, decorate, injectable } from 'inversify';
import { buildProviderModule } from 'inversify-binding-decorators';
import { Types } from './ioc.types';
import { IApp } from '../IApp';
import { App } from '../App';
import { IUserService } from '../services/IUserService';
import { UserService } from '../services/UserService';
import { IStorageService } from '../services/IStorageService';
import { StorageService } from '../services/StorageService';
import { AppDataSource } from './DataSource';

const iocContainer = new Container({ skipBaseClassChecks: true });

decorate(injectable(), Controller);

// In alphabetical order, do not add Controllers here:
iocContainer.bind<IApp>(Types.IApp).to(App);
iocContainer.bind<IUserService>(Types.IUserService).toDynamicValue(() => new UserService(AppDataSource));
iocContainer.bind<IStorageService>(Types.IStorageService).to(StorageService);
iocContainer.load(buildProviderModule());

export { iocContainer };
