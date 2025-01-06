import { WebhookController } from '../controllers/WebhookController';
import { IApp } from '../IApp';
import { IWebhookService } from '../services/IWebhookService';
import { iocContainer } from './ioc';
import { Types } from './ioc.types';

jest.mock('env-var', () => ({
   get: jest.fn().mockImplementation((key) => {
      if (key === 'SENTRY_DSN') {
         return {
            required: () => ({
               asString: () => 'sentryDSN'
            })
         };
      }
      return {
         required: () => ({
            asString: () => '',
            asPortNumber: () => 0,
            default: () => ({
               asString: () => '',
               asPortNumber: () => 0
            })
         }),
         default: () => ({
            asString: () => '',
            asPortNumber: () => 0
         })
      };
   })
}));

describe(`ioc.ts integration tests`, () => {
   // Note that we can't use
   // expect(someobject).toBeInstanceOf(someclass)
   // as it will lead to an obscure inversify error that is very hard to
   // diagnose and resolve. Therefore do not import any of the implementations
   // of the dependencies we are testing to look up here.
   // [Manfred, 16jul2023]
   // Contrary to the above, I have used expect(someobject).toBeInstanceOf(someclass)
   // and it works for cases where a controller is expected to be registered
   // and returned by inversify. [Manfred, 11sep2024]

   // Another tip regarding inversify: If you want to inspect the bindings, set
   // a breakpoint where 'iocContainer' is available and inspect its properties.
   // [Manfred, 16jul2023]

   it(`should return IEnvironment`, () => {
      const environment: IWebhookService = iocContainer.get<IWebhookService>(Types.IWebhookService);
      expect(environment).toBeDefined();
      expect(environment.constructor.name).toBe('WebhookService');
   });

   it(`should return IServer`, () => {
      const server = iocContainer.get<IApp>(Types.IApp);
      expect(server).toBeDefined();
      expect(server.constructor.name).toBe('App');
      // expect(server instanceof Server).toBe(true);
   });

   it(`should return HealthController`, () => {
      const controller = iocContainer.get<WebhookController>(WebhookController);
      expect(controller).toBeDefined();
      expect(controller).toBeInstanceOf(WebhookController);
   });
});
