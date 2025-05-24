import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import {
  AccessTokenPayload,
  RefreshTokenPayload,
} from './interfaces/token-payload.interface';
import { User } from '../users/entities/user.entity';
import { jwtTokens } from './interfaces/jwtTokens';
import { ForbiddenAuthAccessException } from './errors/forbidden-auth-access.exception';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
  ) {}

  async login(
    userName: string,
    password: string,
  ): Promise<{ tokens: jwtTokens; userId: number }> {
    const user = await this.usersService.findOne({ username: userName });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new ForbiddenAuthAccessException();
    }

    return {
      tokens: await this.generateAndStoreTokens(user),
      userId: user.id,
    };
  }

  async refreshTokens(
    userId: number,
    refreshToken: string,
  ): Promise<{ tokens: jwtTokens; userId: number }> {
    const user = await this.usersService.findOne({ id: userId }, ['auth']);

    if (!user || !user.auth.hashedRefreshToken || !user.auth.refreshTokenJti) {
      throw new ForbiddenAuthAccessException();
    }

    const payload = this.jwtService.decode(refreshToken) as { jti?: string };
    if (!payload?.jti || payload.jti !== user.auth.refreshTokenJti) {
      throw new ForbiddenAuthAccessException();
    }

    const rtMatches = await bcrypt.compare(
      refreshToken,
      user.auth.hashedRefreshToken,
    );
    if (!rtMatches) {
      throw new ForbiddenAuthAccessException();
    }

    return {
      tokens: await this.generateAndStoreTokens(user),
      userId: user.id,
    };
  }

  private async generateAndStoreTokens(user: User): Promise<jwtTokens> {
    const access_token = await this.getAccessToken(user);
    const { jti, refresh_token } = await this.getRefreshToken(user);

    await this.usersService.updateRefreshToken(user.id, refresh_token, jti);

    return { access_token, refresh_token };
  }

  private async getAccessToken(user: User): Promise<string> {
    const payload: AccessTokenPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN'),
    });
  }

  private async getRefreshToken(
    user: User,
  ): Promise<{ jti: string; refresh_token: string }> {
    const jti = Math.random().toString(36).substring(2);
    const payload: RefreshTokenPayload = {
      sub: user.id,
      jti,
    };

    return {
      jti: jti,
      refresh_token: await this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
      }),
    };
  }
}
