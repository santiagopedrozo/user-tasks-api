import {
  Inject,
  Injectable, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../entities/task.entity';
import { CreateTaskDto } from '../dtos/create-task.dto';
import { UpdateTaskDto } from '../dtos/update-task.dto';
import { ExternalTaskDto } from '../dtos/external-task.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaginationQueryDto } from '../../shared/dtos/pagination-query.dto';
import { User, UserRole } from '../../users/entities/user.entity';
import { ForbiddenTaskAccessException } from '../errors/forbidden-access.exception';
import { TaskNotFoundException } from '../errors/task-not-found.exception';
import { UsersService } from '../../users/users.service';
import { ITaskClient, ITaskClientName } from '../clients/task-client.interface';
import { SyncTasksResponseDto } from '../dtos/sync-tasks-response.dto';
import { ConfigService } from '@nestjs/config';

export type RequestingUser = Pick<User, 'id' | 'role'>;

@Injectable()
export class TasksService {
  protected readonly logger = new Logger(TasksService.name);

  constructor(
    private configService: ConfigService,
    @InjectRepository(Task)
    private tasksRepo: Repository<Task>,
    private eventEmitter: EventEmitter2,
    private readonly userService: UsersService,
    @Inject(ITaskClientName)
    private readonly taskClient: ITaskClient,
  ) {}

  async getExternalTasks(): Promise<ExternalTaskDto[]> {
    return this.taskClient.findAll();
  }

  async createTask(
    createDto: CreateTaskDto,
    requestingUser: RequestingUser,
  ): Promise<Task> {
    await this.userService.userExists(createDto.userId);
    this.ensureTaskOwnershipOrAdmin(requestingUser, createDto.userId);

    const newTask = this.tasksRepo.create({
      title: createDto.title,
      assignedUserId: createDto.userId,
      createdByUserId: requestingUser.id,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.tasksRepo.save(newTask);
  }

  async deleteTask(
    taskId: string,
    userId: number,
    requestingUser: RequestingUser,
  ): Promise<boolean> {
    this.ensureTaskOwnershipOrAdmin(requestingUser, userId);
    await this.findUserTaskByIdOrFail(taskId, userId);
    await this.tasksRepo.delete({ id: taskId, assignedUserId: userId });
    return true;
  }

  async getUserTasks(
    userId: number,
    getDto: PaginationQueryDto,
  ): Promise<{ data: Task[]; total: number }> {
    const { page, pageSize } = getDto;
    const skip = (page - 1) * pageSize;

    const whereConditions = { assignedUserId: userId };

    const [data, total] = await this.tasksRepo.findAndCount({
      where: whereConditions,
      skip,
      take: pageSize,
      order: {
        createdAt: 'DESC',
      },
      cache: this.configService.get<number>('CACHE_TTL_MS') || 300000
    });

    return {
      data,
      total,
    };
  }

  async findUserTaskById(taskId: string, userId: number): Promise<Task | null> {
    return this.tasksRepo.findOne({
      where: { id: taskId, assignedUserId: userId },
      cache: 60000 * 10,
    });
  }

  async findUserTaskByIdOrFail(taskId: string, userId: number): Promise<Task> {
    const task = await this.findUserTaskById(taskId, userId);

    if (!task) {
      throw new TaskNotFoundException();
    }

    return task;
  }

  async syncExternalTasks(): Promise<SyncTasksResponseDto> {
    const externalTasks= await this.getExternalTasks();

    //move to batches to increase performance
    let syncedTasks = 0;
    for (const externalTask of externalTasks) {

      const userExists = await this.userService.findOne({ id: externalTask.userId });

      if(userExists){
        const taskExists = await this.tasksRepo.findOne({
          where: {
            title: externalTask.title,
            assignedUserId: externalTask.userId,
          },
        });

        if (!taskExists) {
          const mapped = this.mapExternalToLocalTask(externalTask);
          const task = this.tasksRepo.create(mapped);
          const saved = await this.tasksRepo.save(task);

          this.eventEmitter.emit('TASK_CREATED', saved);
          syncedTasks++;
        }
      }
    }

    return {
      processedTasks: externalTasks.length,
      syncedTasks: syncedTasks,
    };
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
    targetUserId: number,
  ): void {
    if (requesting.role === UserRole.USER && requesting.id !== targetUserId) {
      throw new ForbiddenTaskAccessException();
    }
  }

  private mapExternalToLocalTask(dto: ExternalTaskDto): Partial<Task> {
    return {
      assignedUserId: dto.userId,
      createdByUserId: dto.userId,
      title: dto.title,
      completed: dto.completed,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
