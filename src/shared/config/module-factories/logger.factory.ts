import { ConfigService } from '@nestjs/config';
import { TransportTargetOptions } from 'pino';
import { Params } from 'nestjs-pino';
import { randomUUID } from 'crypto';
import { LevelWithSilent } from 'pino';

type Provider = 'GCP' | 'AWS' | 'LOCAL';

export const loggerModuleFactory = async (config: ConfigService) => {
  let target: TransportTargetOptions;

  const provider = config.get<Provider>('PROVIDER');

  if (!provider)
    throw new Error(`Provider ${config.get<Provider>('PROVIDER')} not found`);

  switch (provider) {
    case 'GCP':
      throw new Error('GCP logger not defined');
    case 'AWS':
      throw new Error('GCP logger not defined');
    case 'LOCAL':
      target = {
        target: 'pino-pretty',
        level: 'debug',
        options: {
          colorized: true,
          singleLine: true,
          messageFormat: '{context} - {msg}',
          ignore: 'context,res.headers',
        },
      };
      break;
    default:
      throw new Error('logger not found');
  }
  const params: Params = {
    pinoHttp: {
      autoLogging: false,
      genReqId: (req) => {
        return req.headers?.['x-request-id'] || randomUUID();
      },
      transport: target,
      useLevel: getLoggerLevel(provider),
      level: getLoggerLevel(provider),
      hooks: {
        logMethod(inputArgs, method) {
          return method.apply(this, inputArgs);
        },
      },
    },
  };
  return params;
};

const getLoggerLevel = (provider: Provider): LevelWithSilent => {
  switch (provider) {
    case 'GCP':
      throw new Error('GCP logger level not defined');
    case 'AWS':
      throw new Error('AWS logger level not defined');
    case 'LOCAL':
      return 'debug';
    default:
      throw new Error('logger level not found');
  }
};
