import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';
import { ConfigService } from '@nestjs/config';

import { LoggerForTypeORM } from '../../logger/typeorm.logger';
import { connectionOptions } from '../typeorm/connection-options';

export const getTypeOrmModuleFactory = async (
  configService: ConfigService,
): Promise<TypeOrmModuleOptions> => {
  const isRedisEnabled = configService.get<string>('REDIS_ENABLED') === 'true';

  if (isRedisEnabled) {
    return {
      ...connectionOptions,
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
  }

  return {
    ...connectionOptions,
    autoLoadEntities: true,
    logging: 'all',
    logger: LoggerForTypeORM,
  };
};
