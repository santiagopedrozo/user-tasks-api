import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';
import { ConfigService } from '@nestjs/config';

import { LoggerForTypeORM } from '../../logger/typeorm.logger';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export const getTypeOrmModuleFactory = async (
  configService: ConfigService,
): Promise<TypeOrmModuleOptions> => {
  const isCompiled = __dirname.includes('dist');

  const base: PostgresConnectionOptions = {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [isCompiled ? 'dist/**/*.entity.js' : 'src/**/*.entity.ts'],
    migrations: [isCompiled ? 'dist/migrations/*.js' : 'src/migrations/*.ts'],
  };

  return {
    ...base,
    autoLoadEntities: true,
    cache: {
      type: 'ioredis',
      options: configService.get<string>('REDIS_URL'),
      ignoreErrors: true,
      duration: configService.get<number>('REDIS_DEFAULT_TTL') || 60000,
    },
    logging: 'all',
    logger: LoggerForTypeORM,
  };
};
