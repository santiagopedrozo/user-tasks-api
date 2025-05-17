import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class UpdateUserRoleDto {
  @ApiProperty({ enum: UserRole, example: UserRole.ADMIN })
  @IsEnum(UserRole)
  role: UserRole;
}

/*

seedear initial admin user con env vars
import { User } from '../users/user.entity';
import { UserRole } from '../users/user.entity';
import { hash } from 'bcrypt';
import { DataSource } from 'typeorm';

export async function seedInitialAdmin(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);

  const existingAdmin = await userRepository.findOne({ where: { role: UserRole.ADMIN } });

  if (!existingAdmin) {
    const hashedPassword = await hash('admin123', 10);
    const adminUser = userRepository.create({
      userName: 'admin',
      password: hashedPassword,
      role: UserRole.ADMIN,
    });

    await userRepository.save(adminUser);
    console.log('Admin user created:', adminUser);
  }
}
 */
