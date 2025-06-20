import 'reflect-metadata';
import { IApp } from './IApp';
import { iocContainer } from './configs/ioc';
import { Types } from './configs/ioc.types';
import * as environment from './Environment';
import { AppDataSource } from './configs/DataSource';

let app: IApp;

AppDataSource.initialize().then(() => {
  app = iocContainer.get<IApp>(Types.IApp);
  app.listen(environment.expressPort);
}).catch((error) => {
  console.error('Error during Data Source initialization', error);
});

export { app };
