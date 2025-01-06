import { iocContainer } from './configs/ioc';
import request from 'supertest';
import { Types } from './configs/ioc.types';
import { IApp } from './IApp';
import { Logger } from './configs/Logger';

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

describe('index.ts', () => {
   it('should return a health check message', async () => {
      const container = iocContainer;
      const server = container.get<IApp>(Types.IApp);
      const routes = server.app._router.stack
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         .filter((r: any) => r.route) // only include stacks with routes
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         .map((r: any) => r.route.path); // get the paths of the routes
      Logger.info(routes);
      const response = await request(server.app).get('/webhook/health');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'UP' });
   });
});
