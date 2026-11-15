import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AstronautsService } from './astronauts.service';

@ApiTags('astronauts')
@Controller('astronauts')
export class AstronautsController {
  constructor(private readonly astronautsService: AstronautsService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar todos los astronautas',
    description: 'Devuelve la lista general de tripulantes y médicos de vuelo.',
  })
  @ApiResponse({ status: 200, description: 'Lista de astronautas obtenida exitosamente.' })
  async findAll() {
    return this.astronautsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener perfil biomédico del astronauta',
    description: 'Devuelve datos basales, grupo sanguíneo, misión asignada y rol.',
  })
  @ApiParam({ name: 'id', description: 'ID del astronauta (ej. 1 para Ariel Y.)', example: '1' })
  @ApiResponse({ status: 200, description: 'Perfil del astronauta encontrado.' })
  @ApiResponse({ status: 404, description: 'Astronauta no encontrado.' })
  async findOne(@Param('id') id: string) {
    return this.astronautsService.findOne(id);
  }

  @Get(':id/vitals')
  @ApiOperation({
    summary: 'Consultar signos vitales consolidados actuales',
    description: 'Calcula frecuencia cardíaca, SpO2, temperatura central y alertas activas en tiempo real.',
  })
  @ApiParam({ name: 'id', description: 'ID del astronauta (ej. 1)', example: '1' })
  @ApiResponse({ status: 200, description: 'Signos vitales consolidados obtenidos exitosamente.' })
  @ApiResponse({ status: 404, description: 'Astronauta no encontrado.' })
  async getVitals(@Param('id') id: string) {
    return this.astronautsService.getVitals(id);
  }
}
