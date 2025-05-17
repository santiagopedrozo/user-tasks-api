import { Logger as TypeOrmLogger } from 'typeorm';
import { Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueryRunner } from 'typeorm/query-runner/QueryRunner';

const nestLogger = new Logger(TypeOrmModule.name);
export const LoggerForTypeORM: TypeOrmLogger = {
  logMigration(message: string): any {
    nestLogger.debug(message);
  },
  logSchemaBuild(message: string): any {
    nestLogger.debug(message);
  },
  log(level: 'log' | 'info' | 'warn', message: any): any {
    nestLogger.debug(message);
  },
  logQuery(query: string, parameters?: any[]): any {
    nestLogger.debug({ query, parameters }, 'query run');
  },
  logQueryError(
    error: string | Error,
    query: string,
    parameters?: any[],
    queryRunner?: QueryRunner,
  ): any {
    if ((error as any)?.constraint) {
      nestLogger.debug({ error }, 'typeorm constraint error');
    } else {
      nestLogger.error(
        { error, query, parameters, queryRunner },
        'TypeORM error',
      );
    }
  },
  logQuerySlow(time: number, query: string, parameters?: any[]): any {
    nestLogger.debug({ query, parameters, time }, 'query run with time');
  },
};
