import { ApiProperty } from '@nestjs/swagger';
import { Task } from '../entities/task.entity';

export class TaskResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the task',
    example: 'c8d0f58d-3e6b-4d2e-8e2f-5a765a8e9bda',
  })
  id: string;

  @ApiProperty({
    description: 'Title of the task',
    example: 'Finish project documentation',
  })
  title: string;

  @ApiProperty({
    description: 'Indicates whether the task is completed',
    example: false,
  })
  completed: boolean;

  @ApiProperty({
    description: 'ID of the user who owns the task',
    example: '3',
  })
  userId: number;

  @ApiProperty({
    description: 'Timestamp when the task was created',
    example: '2024-04-10T14:48:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the task was last updated',
    example: '2024-04-12T09:21:00.000Z',
  })
  updatedAt: Date;

  constructor(task: Task) {
    this.id = task.id;
    this.title = task.title;
    this.completed = task.completed;
    this.userId = task.assignedUserId;
    this.createdAt = task.createdAt;
    this.updatedAt = task.updatedAt;
  }
}
