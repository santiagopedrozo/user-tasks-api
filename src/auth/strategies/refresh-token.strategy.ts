import { Request } from 'express';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessTokenPayload } from '../interfaces/token-payload.interface';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: (req: Request) => {
        const token = req?.cookies?.refresh_token;
        if (!token) return null;
        return token;
      },
      secretOrKey: config.get<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  validate(
    req: Request,
    payload: AccessTokenPayload,
  ): {
    sub: number;
    username: string;
    role: string;
    refreshToken: any;
  } {
    const token = req.cookies?.refresh_token;
    if (!token) {
      throw new UnauthorizedException('Missing refresh token in cookie');
    }

    return { ...payload, refreshToken: token };
  }
}
