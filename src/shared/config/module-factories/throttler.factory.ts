import {
  ThrottlerModuleOptions,
  ThrottlerOptionsFactory,
} from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ThrottlerConfigFactory implements ThrottlerOptionsFactory {
  constructor(private configService: ConfigService) {}

  createThrottlerOptions(): ThrottlerModuleOptions {
    if (!this.configService) {
      throw new Error(
        'ConfigService is not injected into ThrottlerConfigFactory',
      );
    }

    return [
      {
        name: 'medium',
        ttl: parseInt(process.env.THROTTLE_MEDIUM_TTL ?? '60000'),
        limit: parseInt(process.env.THROTTLE_MEDIUM_LIMIT ?? '10'),
      },
    ];
  }
}
