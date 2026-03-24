import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get()
  @Get('/api/health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'PANDI CRM Backend',
      version: '1.0.0'
    };
  }
}
