import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Entity('user_auth')
export class UserAuth {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'number' })
  userId: number;

  @OneToOne(() => User)
  @JoinColumn()
  user: User

  @Column({ nullable: true })
  hashedRefreshToken?: string;

  @Column({ nullable: true })
  refreshTokenJti?: string;

  @Column({ nullable: true })
  lastLoginAt?: Date;

  @Column({ nullable: true })
  tokenExpiresAt?: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashRefreshToken() {
    if (this.hashedRefreshToken && !this.hashedRefreshToken.startsWith('$2')) {
      this.hashedRefreshToken = await bcrypt.hash(this.hashedRefreshToken, 10);
    }
  }
}
