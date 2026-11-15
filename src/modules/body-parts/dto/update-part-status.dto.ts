import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { HealthStatus } from '../../../common/interfaces/domain.types';

export class UpdatePartStatusDto {
  @ApiProperty({
    description: 'Nuevo estado de salud para la parte anatómica',
    enum: ['NOMINAL', 'WARNING', 'CRITICAL'],
    example: 'WARNING',
  })
  @IsEnum(['NOMINAL', 'WARNING', 'CRITICAL'])
  healthStatus: HealthStatus;

  @ApiPropertyOptional({
    description: 'Color hexadecimal de visualización 3D (ej. #EF4444 para crítico, #F59E0B para advertencia)',
    example: '#F59E0B',
  })
  @IsOptional()
  @IsString()
  displayColor?: string;

  @ApiPropertyOptional({
    description: 'Motivo o justificación clínica del cambio de estado',
    example: 'Presión intraocular elevada persistente post-EVA',
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({
    description: 'Nivel subjetivo de dolor en la escala de 0 a 10',
    minimum: 0,
    maximum: 10,
    example: 2,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  painLevel?: number;

  @ApiPropertyOptional({
    description: 'Diagnóstico o condición primaria resumida',
    example: 'SANS Grado 1',
  })
  @IsOptional()
  @IsString()
  primaryCondition?: string;

  @ApiPropertyOptional({
    description: 'Indicador de alerta médica activa',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  activeAlert?: boolean;

  @ApiPropertyOptional({
    description: 'Métricas o signos vitales locales actualizados',
    example: { intraocularPressureMmHg: 22.4 },
  })
  @IsOptional()
  lastVitals?: Record<string, number | string>;
}
