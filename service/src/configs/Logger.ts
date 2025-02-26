/* istanbul ignore file */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

// Define your severity levels.
// With them, You can create log files,
// see or hide levels based on the running ENV.
const levels = {
   error: 0,
   warn: 1,
   info: 2,
   http: 3,
   debug: 4
};

// This method set the current severity based on
// the current NODE_ENV: show all the log levels
// if the server was run in development mode; otherwise,
// if it was run in production, show only warn and error messages.
const level = () => {
   const env = process.env.NODE_ENV || 'development';
   const isDevelopment = env === 'development';
   return isDevelopment ? 'debug' : 'info';
};

// Define different colors for each level.
// Colors make the log message more visible,
// adding the ability to focus or ignore messages.
const colors = {
   error: 'red',
   warn: 'yellow',
   info: 'green',
   http: 'magenta',
   debug: 'blue'
};

// Tell winston that you want to link the colors
// defined above to the severity levels.
winston.addColors(colors);

// Chose the aspect of your log customizing the log format.
const format = winston.format.combine(
   winston.format.errors({ stack: true }),
   // Add the message timestamp with the preferred format
   winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
   // Define the format of the message showing the timestamp, the level and the message
   winston.format.printf(({ timestamp, level, message, stack }) => {
      const text = `${timestamp} ${level.toUpperCase()} ${message}`;
      return stack ? text + '\n' + stack : text;
   })
);

// Define which transports the logger must use to print out messages.
// In this example, we are using three different transports
const transports = [
   // Allow the use the console to print the messages
   new winston.transports.Console(),
   // error logs
   new DailyRotateFile({
      filename: 'logs/webhook-service-error-%DATE%.log',
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '60d'
   })
   // all logs
   // new DailyRotateFile({
   //    filename: 'logs/community-service-all-%DATE%.log',
   //    datePattern: 'YYYY-MM-DD',
   //    zippedArchive: true,
   //    maxSize: '20m',
   //    maxFiles: '14d'
   // })
];

// Create the logger instance that has to be exported
// and used to log messages.
const Logger = winston.createLogger({
   level: level(),
   levels,
   format,
   transports
});

export { Logger };
