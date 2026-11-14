import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({ summary: 'Verificar el estado del servicio backend' })
  @ApiResponse({ status: 200, description: 'Servicio en línea y operativo' })
  getHealth() {
    return this.appService.getHealthStatus();
  }

  @Get()
  @ApiOperation({ summary: 'Mensaje de bienvenida y estado' })
  getRoot() {
    return this.appService.getHealthStatus();
  }
}
