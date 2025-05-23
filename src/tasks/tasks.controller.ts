import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTaskDto } from './dtos/create-task.dto';
import { UpdateTaskDto } from './dtos/update-task.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetCurrentUser } from '../auth/decorators/get-current-user.decorator';
import { TaskResponseDto } from './dtos/task-response.dto';
import { PaginatedResponseDto } from '../shared/dtos/paginated-response.dto';
import { PaginationQueryDto } from '../shared/dtos/pagination-query.dto';
import { AccessTokenPayload } from '../auth/interfaces/token-payload.interface';
import { DeleteTaskDto } from './dtos/delete-task.dto';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { SyncTasksResponseDto } from './dtos/sync-tasks-response.dto';

@ApiTags('Tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(
    private readonly tasksService: TasksService
  ) {}

  @Patch('sync-external')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Sync all external tasks to users (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Tasks successfully updated',
    type: SyncTasksResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  async populateTasks() {
    return this.tasksService.syncExternalTasks();
  }

  // Routing
  @Post()

  // Swagger Documentation
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({
    status: 201,
    description: 'The task has been successfully created.',
    type: TaskResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  async createTask(
    @Body() createTaskDto: CreateTaskDto,
    @GetCurrentUser() userFromPayload: AccessTokenPayload,
  ) {
    const createdTask = await this.tasksService.createTask(createTaskDto, {
      id: userFromPayload.sub,
      role: userFromPayload.role,
    });
    return new TaskResponseDto(createdTask);
  }

  // Routing
  @Get()

  // Swagger Documentation
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all tasks by the authenticated user' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of tasks',
    type: PaginatedResponseDto,
  })
  async getTasks(
    @GetCurrentUser('sub') userId: number,
    @Query() pagination: PaginationQueryDto,
  ) {
    const { data, total } = await this.tasksService.getUserTasks(
      userId,
      pagination,
    );
    return new PaginatedResponseDto(
      data,
      total,
      pagination.page,
      pagination.pageSize,
    );
  }

  // Routing
  @Get(':id')

  // Swagger Documentation
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a specific task by its ID' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({
    status: 200,
    description: 'Task found',
    type: TaskResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Task not found',
  })
  async getTaskById(
    @Param('id') id: string,
    @GetCurrentUser('sub') userId: number,
  ) {
    const foundTask = await this.tasksService.findUserTaskByIdOrFail(
      id,
      userId,
    );
    return new TaskResponseDto(foundTask);
  }

  // Routing
  @Patch('/:id')

  // Swagger Documentation
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing task' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiBody({ type: UpdateTaskDto })
  @ApiResponse({
    status: 200,
    description: 'The task has been updated.',
    type: TaskResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Task not found',
  })
  async updateTask(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @GetCurrentUser() userFromPayload: AccessTokenPayload,
  ) {
    const updatedTask = await this.tasksService.updateTask(id, updateTaskDto, {
      id: userFromPayload.sub,
      role: userFromPayload.role,
    });

    return new TaskResponseDto(updatedTask);
  }

  // Routing
  @Delete(':id')
  @HttpCode(204)

  // Swagger Documentation
  @ApiBearerAuth()
  @ApiBody({
    type: DeleteTaskDto
  })
  @ApiOperation({ summary: 'Delete a task by ID' })
  @ApiParam({ name: 'id', description: 'Task ID to delete' })
  @ApiResponse({
    status: 204,
    description: 'Task successfully deleted',
  })
  async deleteTask(
    @Param('id') id: string,
    @GetCurrentUser() userFromPayload: AccessTokenPayload,
    @Body() dto: DeleteTaskDto
  ): Promise<boolean> {
    return await this.tasksService.deleteTask(id, dto.userId, {
      id: userFromPayload.sub,
      role: userFromPayload.role,
    });
  }
}
