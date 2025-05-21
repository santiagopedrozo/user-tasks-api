import { UserRole } from '../../users/entities/user.entity';

export interface AccessTokenPayload {
  sub: number;
  username: string;
  role: UserRole;
}

export interface RefreshTokenPayload {
  sub: number;
  jti: string;
}
