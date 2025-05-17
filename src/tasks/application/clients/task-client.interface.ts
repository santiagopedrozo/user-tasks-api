import { ExternalTaskDto } from '../../application/dtos/external-task.dto';

export interface TaskClient {
  findAll(): Promise<ExternalTaskDto[]>;
}