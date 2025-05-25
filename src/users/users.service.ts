import { Injectable } from '@nestjs/common';
import { User, UserRole } from './entities/user.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserNotFoundException } from './errors/user-not-found.exception';
import { CreateUserDto } from './dto/create-user.dto';
import { UserAlreadyExistsException } from './errors/user-already-exists.exception';
import { UserAuth } from './entities/user_auth.entity';
import { RequestingUser } from '../tasks/tasks.service';
import { ForbiddenUserRoleUpdateException } from './errors/forbidden-user-role-update.exception';
import { ForbiddenUserRoleDeleteException } from './errors/forbidden-user-role-delete.exception';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(UserAuth)
    private userAuthRepo: Repository<UserAuth>,
  ) {}

  async findOne(
    where: FindOptionsWhere<User>,
    relations?: string[],
  ): Promise<User | null> {
    return await this.usersRepo.findOne({ where, relations });
  }

  async findAll(
    where: FindOptionsWhere<User>,
    relations?: string[],
  ): Promise<User[]> {
    return await this.usersRepo.find({ where, relations });
  }

  async updateRefreshToken(
    userId: number,
    refreshToken: string,
    refreshTokenJti: string,
  ): Promise<void> {
    const auth = this.userAuthRepo.create({
      user: { id: userId },
      hashedRefreshToken: refreshToken,
      refreshTokenJti,
    });

    await this.userAuthRepo.upsert(auth, ['user']);
  }

  async insertUser(dto: CreateUserDto): Promise<User> {
    const foundUser = await this.usersRepo.findOne({
      where: { username: dto.username },
    });
    if (foundUser) {
      throw new UserAlreadyExistsException();
    }

    const foundUsers = await this.findAll({}, []);

    const user = this.usersRepo.create({
      username: dto.username,
      password: dto.password,
      role: foundUsers.length == 0 ? UserRole.ADMIN : UserRole.USER,
    });
    return await this.usersRepo.save(user);
  }

  async deleteUser(
    userId: number,
    requestingUser: RequestingUser,
  ): Promise<void> {
    if (requestingUser.role === UserRole.USER && requestingUser.id !== userId) {
      throw new ForbiddenUserRoleDeleteException();
    }

    const user = await this.usersRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    const userAuth = await this.userAuthRepo.findOne({ where: { userId } });
    if (userAuth) {
      await this.userAuthRepo.remove(userAuth);
    }

    await this.usersRepo.remove(user);
  }

  async updateUserRole(
    adminUser: RequestingUser,
    userId: number,
    newRole: UserRole,
  ): Promise<User> {
    if (adminUser.role !== UserRole.ADMIN) {
      throw new ForbiddenUserRoleUpdateException();
    }

    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new UserNotFoundException();

    user.role = newRole;
    return await this.usersRepo.save(user);
  }

  async userExists(userId: number): Promise<boolean> {
    const count = await this.usersRepo.count({ where: { id: userId } });

    if (count == 0) {
      throw new UserNotFoundException();
    }

    return true;
  }
}
