import cors from 'cors';
import actuator from 'express-actuator';
import swaggerDocument from '../tsoa-generated/swagger.json';
import swaggerUi from 'swagger-ui-express';
import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { RegisterRoutes } from '../tsoa-generated/routes';
import { injectable } from 'inversify';
import { IApp } from './IApp';
import { Logger } from './configs/Logger';
import { errorHandler } from './errors';
import * as environment from './Environment';

const basePath = '/chat';

@injectable()
export class App implements IApp {
   private readonly _app: express.Express = express();
   private readonly port: number = environment.expressPort;
   private server: http.Server | null = null;
   private io: SocketIOServer | null = null;

   constructor() {
      this.app.use(cors());

      // Enable CORS for pre-flight
      this.app.options('*', cors());

      this.app.use(express.json());

      // Add support for /health EP
      this.app.use(
         actuator({
            basePath: basePath,
            infoGitMode: 'simple',
         })
      );

      this.app.use(`${basePath}/docs/swagger.json`, (_req, res) => {
         res.json(swaggerDocument);
      });

      this.app.use(
         `${basePath}/docs`,
         swaggerUi.serve,
         swaggerUi.setup(swaggerDocument, {
            explorer: true,
         })
      );

      // Register TSOA routes
      RegisterRoutes(this.app);

      // Error handler
      this.app.use(errorHandler);

      // Initialize real-time chat (Socket.IO)
      this.initializeSocket();
   }

   public async listen(port: number = this.port): Promise<http.Server> {
      if (!this.server) {
         this.server = http.createServer(this._app);

         if (this.io) {
            this.io.attach(this.server);
         }
      }

      Logger.info(`App is running on port ${environment.expressPort} and basePath ${basePath}`);
      Logger.info(`Swagger is available at http://localhost:${environment.expressPort}${basePath}/docs`);

      return this.server.listen(port, () => {
         Logger.info(`Server listening on port ${port}`);
      });
   }

   public get app(): express.Express {
      return this._app;
   }

   /**
    * Initialize Socket.IO for real-time chat functionality.
    */
   private initializeSocket(): void {
      this.io = new SocketIOServer({
         cors: {
            origin: '*', // Adjust this for production
         },
      });

      this.io.on('connection', (socket) => {
         Logger.info(`New client connected: ${socket.id}`);

         // Example: Handle joining a chat room
         socket.on('joinRoom', (room) => {
            socket.join(room);
            Logger.info(`Client ${socket.id} joined room: ${room}`);
         });

         // Example: Handle sending messages
         socket.on('sendMessage', (data) => {
            const { room, message } = data;
            Logger.info(`Message received for room ${room}: ${message}`);

            // Broadcast the message to all clients in the room
            this.io?.to(room).emit('newMessage', { message, sender: socket.id });
         });

         // Handle disconnection
         socket.on('disconnect', () => {
            Logger.info(`Client disconnected: ${socket.id}`);
         });
      });
   }
}
