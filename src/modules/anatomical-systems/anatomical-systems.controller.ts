import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AnatomicalSystemsService } from './anatomical-systems.service';
import { UpdateSystemPartDto } from './dto/update-system-part.dto';

@ApiTags('anatomical-systems')
@Controller('astronauts/:astronautId/systems')
export class AnatomicalSystemsController {
  constructor(
    private readonly systemsService: AnatomicalSystemsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Listar resumen de los 5 sistemas anatómicos del astronauta',
    description:
      'Devuelve el conteo de partes, alertas y estado general de body, skeleton, cardiovascular, nervous y organs.',
  })
  @ApiParam({ name: 'astronautId', example: '1', description: 'ID del astronauta' })
  @ApiResponse({ status: 200, description: 'Resumen de sistemas obtenido exitosamente.' })
  async getSystemsOverview(@Param('astronautId') astronautId: string) {
    return this.systemsService.getSystemsOverview(astronautId);
  }

  @Get(':system')
  @ApiOperation({
    summary: 'Obtener proyección completa de un sistema anatómico específico',
    description:
      'Retorna el mapa completo de partes, colores hex, estados de salud y signos locales del sistema seleccionado (body, skeleton, cardiovascular, nervous, organs).',
  })
  @ApiParam({ name: 'astronautId', example: '1' })
  @ApiParam({
    name: 'system',
    example: 'skeleton',
    description: 'Sistema anatómico: body | skeleton | cardiovascular | nervous | organs',
  })
  @ApiResponse({ status: 200, description: 'Proyección del sistema obtenida exitosamente.' })
  @ApiResponse({ status: 400, description: 'Sistema anatómico inválido.' })
  async getSystemProjection(
    @Param('astronautId') astronautId: string,
    @Param('system') system: string,
  ) {
    return this.systemsService.getSystemProjection(astronautId, system);
  }

  @Get(':system/:partId')
  @ApiOperation({
    summary: 'Consultar detalle clínico de una parte anatómica dentro de un sistema',
  })
  @ApiParam({ name: 'astronautId', example: '1' })
  @ApiParam({ name: 'system', example: 'skeleton' })
  @ApiParam({ name: 'partId', example: 'FemurDer', description: 'ID de la parte/hueso/vaso/órgano (ej. FemurDer, Pulmones, Pecho)' })
  @ApiResponse({ status: 200, description: 'Detalle de la parte obtenido.' })
  @ApiResponse({ status: 404, description: 'Parte o sistema no encontrado.' })
  async getPartDetail(
    @Param('astronautId') astronautId: string,
    @Param('system') system: string,
    @Param('partId') partId: string,
  ) {
    return this.systemsService.getPartDetail(astronautId, system, partId);
  }

  @Patch(':system/:partId')
  @ApiOperation({
    summary: 'Actualizar estado clínico y color 3D de una parte anatómica de cualquier sistema',
    description:
      'Emite SYSTEM_PART_STATUS_CHANGED, actualiza la proyección en base de datos y difunde por WebSocket a los clientes 3D conectados.',
  })
  @ApiParam({ name: 'astronautId', example: '1' })
  @ApiParam({ name: 'system', example: 'skeleton' })
  @ApiParam({ name: 'partId', example: 'FemurDer' })
  @ApiBody({ type: UpdateSystemPartDto })
  @ApiResponse({ status: 200, description: 'Parte actualizada exitosamente.' })
  async updatePart(
    @Param('astronautId') astronautId: string,
    @Param('system') system: string,
    @Param('partId') partId: string,
    @Body() dto: UpdateSystemPartDto,
  ) {
    return this.systemsService.updatePart(astronautId, system, partId, dto);
  }
}
