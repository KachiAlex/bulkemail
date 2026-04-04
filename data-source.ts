import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as path from 'path';

const databaseUrl = process.env.DATABASE_URL;

const dataSourceOptions: any = {
  type: 'postgres',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: [path.join(__dirname, 'src', '**', '*.entity.{ts,js}')],
  migrations: [path.join(__dirname, 'src', 'migrations', '*.{ts,js}')],
};

if (databaseUrl) {
  dataSourceOptions.url = databaseUrl;
} else {
  dataSourceOptions.host = process.env.DATABASE_HOST || 'localhost';
  dataSourceOptions.port = Number(process.env.DATABASE_PORT) || 5432;
  dataSourceOptions.username = process.env.DATABASE_USERNAME || 'postgres';
  dataSourceOptions.password = process.env.DATABASE_PASSWORD || 'postgres';
  dataSourceOptions.database = process.env.DATABASE_NAME || 'aicrm';
}

export const AppDataSource = new DataSource(dataSourceOptions);

if (require.main === module) {
  AppDataSource.initialize()
    .then(() => console.log('DataSource initialized'))
    .catch((err) => console.error('Error during DataSource initialization', err));
}
