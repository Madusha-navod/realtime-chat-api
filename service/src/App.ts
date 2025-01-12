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
import axios from 'axios';

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

      // Store user language preferences: socket.id -> { room, language }
      const userPreferences = new Map<string, { room: string, language: string }>();

      this.io.on('connection', (socket) => {
         Logger.info(`New client connected: ${socket.id}`);

         // Handle joining a chat room with language preference
         socket.on('joinRoom', (data: { room: string, language: string }) => {
            const { room, language } = data;

            if (room && language) {
               socket.join(room);
               userPreferences.set(socket.id, { room, language });

               Logger.info(`Client ${socket.id} joined room: ${room} with language: ${language}`);
               socket.emit('joinedRoom', { room, language });
            } else {
               socket.emit('error', { message: 'Room and language are required to join.' });
            }
         });

         // Handle sending messages with translation
         socket.on('sendMessage', async (data: { room: string, message: string }) => {
            const { room, message } = data;
            Logger.info(`Message received for room ${room}: ${message}`);

            const clients = await this.io!.in(room).fetchSockets();

            for (const client of clients) {
               const pref = userPreferences.get(client.id);

               if (pref && pref.room === room) {
                  try {
                     const response = await axios.post('http://localhost:5070/translate', {
                        q: message,
                        source: 'auto',
                        target: pref.language,
                        format: 'text'
                     });

                     const translatedMessage = response.data.translatedText;

                     client.emit('newMessage', {
                        message: translatedMessage,
                        originalMessage: message,
                        sender: socket.id,
                        language: pref.language
                     });

                     Logger.info(`Sent translated message to ${client.id} in ${pref.language}: ${translatedMessage}`);
                  } catch (error) {
                     Logger.error(`Translation error for client ${client.id}: ${error}`);
                     client.emit('error', { message: 'Translation failed', error: (error as Error).message });
                  }
               }
            }
         });

         // Handle disconnection and clean up
         socket.on('disconnect', () => {
            Logger.info(`Client disconnected: ${socket.id}`);
            userPreferences.delete(socket.id);
         });
      });
   }
}
