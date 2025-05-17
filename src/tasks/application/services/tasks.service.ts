import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../domain/entities/task.entity';
import { CreateTaskDto } from '../application/dtos/create-task.dto';
import { UpdateTaskDto } from '../application/dtos/update-task.dto';
import { lastValueFrom } from 'rxjs';
import { ExternalTaskApiService } from '../infrastructure/clients/external-task-api.service';
import { ExternalTaskDto } from '../application/dtos/external-task.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaginationQueryDto } from '../../shared/dtos/pagination-query.dto';
import { User, UserRole } from '../../users/entities/user.entity';
import { ForbiddenTaskAccessException } from '../domain/errors/forbidden-access.exception';
import { TaskNotFoundException } from '../domain/errors/task-not-found.exception';
import { UsersService } from '../../users/users.service';

export type RequestingUser = Pick<User, 'id' | 'role'>;

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepo: Repository<Task>,
    private eventEmitter: EventEmitter2,
    private readonly userService: UsersService,
  ) {}

  async createTask(
    createDto: CreateTaskDto,
    requestingUser: RequestingUser,
  ): Promise<Task> {
    await this.userService.userExists(createDto.userId);
    this.ensureTaskOwnershipOrAdmin(requestingUser, createDto.userId);

    const newTask = this.tasksRepo.create({
      title: createDto.title,
      userId: createDto.userId,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.tasksRepo.save(newTask);
  }

  async deleteTask(
    taskId: string,
    userId: string,
    requestingUser: RequestingUser,
  ): Promise<boolean> {
    this.ensureTaskOwnershipOrAdmin(requestingUser, userId);
    await this.findUserTaskByIdOrFail(taskId, userId);
    await this.tasksRepo.delete({ id: taskId, userId });
    return true;
  }

  async getUserTasks(
    userId: string,
    getDto: PaginationQueryDto,
  ): Promise<{ data: Task[]; total: number }> {
    const { page, pageSize } = getDto;
    const skip = (page - 1) * pageSize;

    const whereConditions = { userId };

    const [data, total] = await this.tasksRepo.findAndCount({
      where: whereConditions,
      skip,
      take: pageSize,
      order: {
        createdAt: 'DESC',
      },
      cache: 60000 * 10,
    });

    return {
      data,
      total,
    };
  }

  async findUserTaskById(taskId: string, userId: string): Promise<Task | null> {
    return this.tasksRepo.findOne({
      where: { id: taskId, userId: userId },
      cache: 60000 * 10,
    });
  }

  async findUserTaskByIdOrFail(taskId: string, userId: string): Promise<Task> {
    const task = await this.findUserTaskById(taskId, userId);

    if (!task) {
      throw new TaskNotFoundException();
    }

    return task;
  }

  async syncExternalTasks(): Promise<void> {
    /*
    const { data: externalTasks } = await lastValueFrom(
      this.externalTaskApi.findAll(),
    );

    for (const externalTask of externalTasks) {
      const exists = await this.tasksRepo.findOne({
        where: {
          title: externalTask.title,
          userId: String(externalTask.userId),
        },
      });

      if (!exists) {
        const mapped = this.mapExternalToLocalTask(externalTask);
        const task = this.tasksRepo.create(mapped);
        const saved = await this.tasksRepo.save(task);

        this.eventEmitter.emit('TASK_CREATED', saved);
      }
    }

     */
  }

  async updateTask(
    taskId: string,
    updateDto: UpdateTaskDto,
    requestingUser: RequestingUser,
  ): Promise<Task> {
    const task: Task = await this.findUserTaskByIdOrFail(
      taskId,
      updateDto.userId,
    );

    this.ensureTaskOwnershipOrAdmin(requestingUser, updateDto.userId);

    const wasPreviouslyCompleted = task.completed;

    if (updateDto.title) task.title = updateDto.title;
    if (updateDto.completed !== undefined) task.completed = updateDto.completed;

    task.updatedAt = new Date();
    const updated = await this.tasksRepo.save(task);

    if (!wasPreviouslyCompleted && updateDto.completed === true) {
      this.eventEmitter.emit('TASK_COMPLETED', updated);
    }

    return updated;
  }

  private ensureTaskOwnershipOrAdmin(
    requesting: RequestingUser,
    targetUserId: string,
  ): void {
    if (requesting.role === UserRole.USER && requesting.id !== targetUserId) {
      throw new ForbiddenTaskAccessException();
    }
  }

  private mapExternalToLocalTask(dto: ExternalTaskDto): Partial<Task> {
    return {
      userId: String(dto.userId),
      title: dto.title,
      completed: dto.completed,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
