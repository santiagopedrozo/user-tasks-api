import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { UsersModule } from '../users/users.module';
import { HttpModule } from '@nestjs/axios';
import { TypicodeTaskClient } from './clients/typicode-task-client';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ITaskClientName } from './clients/task-client.interface';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [TasksController],
  providers: [
    TasksService,
    {
      provide: ITaskClientName,
      useClass: TypicodeTaskClient,
    },
  ],
  imports: [ConfigModule, UsersModule, HttpModule, TypeOrmModule.forFeature([Task]), EventEmitterModule.forRoot()],
  exports: [TasksService]
})
export class TasksModule {}
