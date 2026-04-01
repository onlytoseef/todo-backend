import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller()
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Get('health')
  async health() {
    let database: 'up' | 'down' = 'up';

    try {
      await this.dataSource.query('SELECT 1');
    } catch {
      database = 'down';
    }

    return {
      status: database === 'up' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptimeSeconds: process.uptime(),
      database,
    };
  }

  @Get()
  root() {
    return {
      message: 'Todo App Backend is running',
      health: '/health',
    };
  }
}
