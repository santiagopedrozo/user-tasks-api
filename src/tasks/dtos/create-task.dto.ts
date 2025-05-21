import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  Length,
  IsUUID,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({
    description: 'Title of the task',
    example: 'Finish project documentation',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  title: string;

  @ApiProperty({
    description: 'Detailed description of the task',
    example: 'Complete the README and contribution guidelines.',
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 1000)
  description: string;

  @ApiProperty({
    description: 'ID of the user who owns the task',
    example: '3',
  })
  @IsNotEmpty()
  userId: number;

  @ApiPropertyOptional({
    description: 'Indicates if the task is completed',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}
