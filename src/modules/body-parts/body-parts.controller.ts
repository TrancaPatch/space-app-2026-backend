import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BodyPartsService } from './body-parts.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdatePartStatusDto } from './dto/update-part-status.dto';

@ApiTags('body-parts')
@Controller('astronauts/:astronautId/body-parts')
export class BodyPartsController {
  constructor(private readonly bodyPartsService: BodyPartsService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener proyección en tiempo real de las 49 partes del cuerpo',
    description:
      'Retorna el estado de salud y los colores hexadecimales de todas las partes para inicializar el avatar 3D.',
  })
  @ApiParam({ name: 'astronautId', example: 'astro_ripley', description: 'ID del astronauta' })
  @ApiResponse({ status: 200, description: 'Mapa completo de 49 partes y metadatos.' })
  @ApiResponse({ status: 404, description: 'Astronauta no encontrado.' })
  async getBodyProjection(@Param('astronautId') astronautId: string) {
    return this.bodyPartsService.getBodyProjection(astronautId);
  }

  @Get(':partId')
  @ApiOperation({
    summary: 'Consultar estado clínico de una parte anatómica específica',
    description:
      'Devuelve el estado, signos vitales locales, dolor, alerta activa y metadatos del sensor.',
  })
  @ApiParam({ name: 'astronautId', example: 'astro_ripley' })
  @ApiParam({ name: 'partId', example: 'OjoDer', description: 'Identificador exacto de la parte 3D' })
  @ApiResponse({ status: 200, description: 'Detalle de la parte anatómica.' })
  @ApiResponse({ status: 400, description: 'Identificador de parte anatómica inválido.' })
  @ApiResponse({ status: 404, description: 'Astronauta o parte no encontrada.' })
  async getBodyPart(
    @Param('astronautId') astronautId: string,
    @Param('partId') partId: string,
  ) {
    return this.bodyPartsService.getBodyPart(astronautId, partId);
  }

  @Get(':partId/history')
  @ApiOperation({
    summary: 'Obtener bitácora histórica de eventos de una parte anatómica',
    description:
      'Retorna la secuencia cronológica de eventos clínicos, telemetría y diagnósticos de esa parte.',
  })
  @ApiParam({ name: 'astronautId', example: 'astro_ripley' })
  @ApiParam({ name: 'partId', example: 'OjoDer' })
  @ApiResponse({ status: 200, description: 'Historial cronológico de eventos.' })
  async getPartHistory(
    @Param('astronautId') astronautId: string,
    @Param('partId') partId: string,
  ) {
    return this.bodyPartsService.getPartHistory(astronautId, partId);
  }

  @Patch(':partId')
  @ApiOperation({
    summary: 'Actualizar estado clínico y color 3D de una parte anatómica',
    description:
      'Emite un evento inmutable BODY_PART_STATUS_CHANGED, actualiza la proyección y notifica en tiempo real.',
  })
  @ApiParam({ name: 'astronautId', example: 'astro_ripley' })
  @ApiParam({ name: 'partId', example: 'OjoDer' })
  @ApiBody({ type: UpdatePartStatusDto })
  @ApiResponse({ status: 200, description: 'Estado actualizado y evento emitido.' })
  async updatePartStatus(
    @Param('astronautId') astronautId: string,
    @Param('partId') partId: string,
    @Body() dto: UpdatePartStatusDto,
  ) {
    return this.bodyPartsService.updatePartStatus(astronautId, partId, dto);
  }

  @Patch(':partId/status')
  @ApiOperation({
    summary: 'Alias de ruta para actualizar estado de la parte anatómica',
  })
  @ApiParam({ name: 'astronautId', example: 'astro_ripley' })
  @ApiParam({ name: 'partId', example: 'OjoDer' })
  @ApiBody({ type: UpdatePartStatusDto })
  @ApiResponse({ status: 200, description: 'Estado actualizado.' })
  async updatePartStatusAlias(
    @Param('astronautId') astronautId: string,
    @Param('partId') partId: string,
    @Body() dto: UpdatePartStatusDto,
  ) {
    return this.bodyPartsService.updatePartStatus(astronautId, partId, dto);
  }

  @Post(':partId/records')
  @ApiOperation({
    summary: 'Registrar un nuevo evento clínico o síntoma para una parte anatómica',
    description:
      'Registra un examen, intervención, incidente o tratamiento emitiendo CLINICAL_RECORD_ADDED.',
  })
  @ApiParam({ name: 'astronautId', example: 'astro_ripley' })
  @ApiParam({ name: 'partId', example: 'OjoDer' })
  @ApiBody({ type: CreateMedicalRecordDto })
  @ApiResponse({ status: 201, description: 'Registro médico agregado al historial.' })
  async addMedicalRecord(
    @Param('astronautId') astronautId: string,
    @Param('partId') partId: string,
    @Body() dto: CreateMedicalRecordDto,
  ) {
    return this.bodyPartsService.addMedicalRecord(astronautId, partId, dto);
  }
}
