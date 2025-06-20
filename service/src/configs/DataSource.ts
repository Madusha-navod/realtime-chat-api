import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { dbHost, dbPort, dbUsername, dbPassword, dbName } from '../Environment';
import { User } from '../entities/User';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: dbHost,
  port: dbPort,
  username: dbUsername,
  password: dbPassword,
  database: dbName,
  entities: [User],
//   synchronize: true, // Set to false in production and use migrations
  logging: false,
});
