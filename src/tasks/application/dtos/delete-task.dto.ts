import { CreateTaskDto } from './create-task.dto';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class DeleteTaskDto extends PartialType(CreateTaskDto) {
  @ApiProperty({
    description: 'UUID of the user who owns the task',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
