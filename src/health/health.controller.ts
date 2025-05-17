import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health check', description: 'Returns app status' })
  @ApiResponse({
    status: 200,
    description: 'Application is up and running',
    schema: {
      example: { status: 'ok' },
    },
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests - throttling limit reached',
  })
  checkHealth() {
    return { status: 'ok' };
  }
}
