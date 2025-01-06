import 'reflect-metadata';
import { IApp } from './IApp';
import { iocContainer } from './configs/ioc';
import { Types } from './configs/ioc.types';
import * as environment from './Environment';

const app: IApp = iocContainer.get<IApp>(Types.IApp);

app.listen(environment.expressPort);

export { app };
