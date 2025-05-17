import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Unique username for the user',
    example: 'johndoe',
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'Password for the new user (min 6 characters)',
    example: 'strongPass123',
  })
  @IsString()
  @MinLength(6)
  password: string;
}
