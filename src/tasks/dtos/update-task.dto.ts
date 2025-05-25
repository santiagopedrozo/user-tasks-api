import { CreateTaskDto } from './create-task.dto';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @ApiProperty({
    description: 'ID of the user who owns the task',
    example: '3',
  })
  @IsNotEmpty()
  userId: number;
}
