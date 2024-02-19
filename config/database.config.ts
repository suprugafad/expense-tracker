import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
  'database.config',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT, 10),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: String(process.env.POSTGRES_DB),
    entities: [__dirname + '/../**/*.entity.ts'],
    synchronize: process.env.TYPEORM_SYNC === 'true',
  }),
);
