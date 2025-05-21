import { ExternalTaskDto } from '../dtos/external-task.dto';

export const ITaskClientName = 'ITaskClient'
export interface ITaskClient {
  findAll(): Promise<ExternalTaskDto[]>;
}