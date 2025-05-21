import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class GetUserDto {
  @ApiProperty({
    description: 'Unique identifier for the user',
    example: '3',
    format: 'id',
  })
  id: number;

  @ApiProperty({
    description: 'The username chosen by the user',
    example: 'johndoe',
  })
  username: string;

  @ApiProperty({
    description: 'Role assigned to the user (e.g. admin, user)',
    example: 'user',
  })
  role: string;

  constructor(user: User) {
    this.id = user.id;
    this.username = user.username;
    this.role = user.role;
  }
}
