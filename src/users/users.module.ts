import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UserAuth } from './entities/user_auth.entity';

@Module({
  providers: [UsersService],
  imports: [TypeOrmModule.forFeature([User, UserAuth])],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
