import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export const jwtModuleFactory = (config: ConfigService): JwtModuleOptions => {
  const accessSecret = config.get<string>('JWT_ACCESS_SECRET');
  const accessExpiresIn = config.get<string>('JWT_ACCESS_EXPIRES_IN');

  if (!accessSecret || !accessExpiresIn) {
    throw new Error('JWT access secret or expiration not defined');
  }

  return {
    secret: accessSecret,
    signOptions: {
      expiresIn: accessExpiresIn,
    },
  };
};
