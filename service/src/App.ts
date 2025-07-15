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
import multer from 'multer';
import path from 'path';

const basePath = '/chat';
const FILE_SIZE_LIMIT = 10 * 1024 * 1024; // 10 MB
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, path.resolve(__dirname, '../../storage'));
  },
  filename: function (_req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage, limits: { fileSize: FILE_SIZE_LIMIT } });

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
      // RegisterRoutes(this.app);
        RegisterRoutes(this.app, { multer: upload });

      // Error handler
      this.app.use(errorHandler);

      // Serve static files from /chat/storage
      this.app.use('/chat/storage', express.static(path.resolve(__dirname, '../../storage')));

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

      // Store user preferences: socket.id -> { room, language, first_name, last_name }
      const userPreferences = new Map<string, { room: string, language: string, first_name: string, last_name: string }>();

      this.io.on('connection', (socket) => {
         Logger.info(`New client connected: ${socket.id}`);

         // Handle joining a chat room with language preference and user name
         socket.on('joinRoom', (data: { room: string, language: string, first_name: string, last_name: string }) => {
            const { room, language, first_name, last_name } = data;

            if (room && language && first_name && last_name) {
               socket.join(room);
               userPreferences.set(socket.id, { room, language, first_name, last_name });

               Logger.info(`Client ${socket.id} joined room: ${room} with language: ${language}, name: ${first_name} ${last_name}`);
               socket.emit('joinedRoom', { room, language, first_name, last_name });
            } else {
               socket.emit('error', { message: 'Room, language, first name, and last name are required to join.' });
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
                     const response = await fetch('http://localhost:5070/translate', {
                        method: 'POST',
                        body: JSON.stringify({
                           q: message,
                           source: 'auto',
                           target: pref.language,
                           format: 'text',
                           alternatives: 1,
                           api_key: ''
                        }),
                        headers: { 'Content-Type': 'application/json' }
                     });
                     const data = await response.json();
                     console.log(`Translation response for client ${client.id}:`, data);
                     const translatedMessage = data.translatedText;

                     const senderPref = userPreferences.get(socket.id);

                     console.log(`Sender preferences for client ${socket.id}:`, senderPref);

                     client.emit('newMessage', {
                        message: translatedMessage,
                        originalMessage: message,
                        sender: socket.id,
                        language: pref.language,
                        first_name: senderPref?.first_name,
                        last_name: senderPref?.last_name
                     });

                     Logger.info(`Sent translated message to ${client.id} in ${pref.language}: ${translatedMessage}`);
                  } catch (error) {
                     Logger.error(`Translation error for client ${client.id}: ${error}`);
                     client.emit('error', { message: 'Translation failed', error: (error as Error).message });
                  }
               }
            }
         });

         // Handle file sharing (image/file URL)
socket.on('sendFile', (data: { room: string, fileName: string, fileType: string, fileData: string, first_name: string, last_name: string }) => {
   const { room, fileName, fileType, fileData, first_name, last_name } = data;
   Logger.info(`File received for room ${room}: ${fileName} (${fileType})`);

   // Broadcast to everyone else in the room except the sender
   socket.to(room).emit('newFile', {
      fileName,
      fileType,
      fileData, // This is the URL (for images) or base64 (for other files)
      first_name,
      last_name
   });
});

         // Handle disconnection and clean up
         socket.on('disconnect', () => {
            Logger.info(`Client disconnected: ${socket.id}`);
            userPreferences.delete(socket.id);
         });
      });
   }
}
