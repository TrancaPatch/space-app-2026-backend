import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MissionsService } from './missions.service';

@ApiTags('missions')
@Controller('missions')
export class MissionsController {
  constructor(private readonly missionsService: MissionsService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar todas las misiones espaciales',
    description: 'Retorna el catálogo completo de misiones activas y programadas.',
  })
  @ApiResponse({ status: 200, description: 'Lista de misiones obtenida exitosamente.' })
  async findAll() {
    return this.missionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener detalle de una misión espacial',
    description: 'Devuelve información operativa, entorno orbital y tripulantes de la misión.',
  })
  @ApiParam({ name: 'id', description: 'ID de la misión (ej. artemis-iii)', example: 'artemis-iii' })
  @ApiResponse({ status: 200, description: 'Detalle de la misión encontrado.' })
  @ApiResponse({ status: 404, description: 'Misión no encontrada.' })
  async findOne(@Param('id') id: string) {
    return this.missionsService.findOne(id);
  }

  @Get(':id/astronauts')
  @ApiOperation({
    summary: 'Listar la tripulación de una misión',
    description: 'Devuelve todos los astronautas asignados a la misión indicada.',
  })
  @ApiParam({ name: 'id', description: 'ID de la misión', example: 'artemis-iii' })
  @ApiResponse({ status: 200, description: 'Tripulantes de la misión obtenidos exitosamente.' })
  @ApiResponse({ status: 404, description: 'Misión no encontrada.' })
  async findCrew(@Param('id') id: string) {
    return this.missionsService.findCrew(id);
  }
}
