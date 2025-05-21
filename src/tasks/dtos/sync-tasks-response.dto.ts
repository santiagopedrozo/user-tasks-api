import { ApiProperty } from '@nestjs/swagger';

export class SyncTasksResponseDto{
  @ApiProperty({
    description: 'Fetched tasks from external API',
    example: '200',
  })
  processedTasks: number;

  @ApiProperty({
    description: 'Synchronized tasks from external to DB',
    example: '20',
  })
  syncedTasks: number;
}