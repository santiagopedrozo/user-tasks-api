import { CreateTaskDto } from './create-task.dto';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class DeleteTaskDto extends PartialType(CreateTaskDto) {
  @ApiProperty({
    description: 'ID of the user who owns the task',
    example: '3',
  })
  @IsNotEmpty()
  userId: number;
}
