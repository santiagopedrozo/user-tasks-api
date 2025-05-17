import { Module } from '@nestjs/common';
import { TasksService } from './service/tasks.service';
import { TasksController } from './tasks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { ExternalTaskApiModule } from '../external-task-api/external-task-api.module';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [TasksController],
  providers: [TasksService],
  imports: [TypeOrmModule.forFeature([Task]), ExternalTaskApiModule, UsersModule],
  exports: [TasksService]
})
export class TasksModule {}
