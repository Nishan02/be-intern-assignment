import { DataSource } from 'typeorm';
import path from 'path';

// Setup connection config
export const AppDataSource = new DataSource({
  type: 'sqlite',
  // Resolve DB location - keeps it stable regardless of where the app is started
  database: path.join(__dirname, '..', 'database.sqlite'),
  
  // Keep this false in production; migrations are safer
  synchronize: false, 
  
  logging: process.env.NODE_ENV === 'development', // only log in dev mode
  
  // Point to compiled js or source ts files
  entities: [path.join(__dirname, 'entities/**/*.{ts,js}')],
  migrations: [path.join(__dirname, 'migrations/**/*.{ts,js}')],
  
  subscribers: [],
});