import { ExternalTaskDto } from '../dtos/external-task.dto';
import { firstValueFrom, map } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { ITaskClient } from './task-client.interface';

@Injectable()
export class TypicodeTaskClient implements ITaskClient{
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private url = this.configService.get<string>('URL_TYPICODE_PLACEHOLDER_API') || 'undefined';

  async findAll(): Promise<ExternalTaskDto[]> {
    const response$ = this.httpService.get(`${this.url}/todos`).pipe(
      map(response => response?.data?.map(this.mapToDto))
    );

    return firstValueFrom(response$);
  }

  private mapToDto(apiData: any): ExternalTaskDto {
    return {
      id: apiData.id,
      userId: apiData.userId,
      title: apiData.title,
      completed: apiData.completed,
    };
  }
}