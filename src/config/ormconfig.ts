import { join } from 'path';
import { config } from 'dotenv';
import { ConnectionOptions } from 'typeorm';

config();

const ormconfig: ConnectionOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [join(__dirname, '..', '**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, '..', 'migrations/**/*{.ts,.js}')],
  cli: {
    migrationsDir: 'src/migrations',
  },
};

export default ormconfig;
