import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { HealthStatus } from '../../../common/interfaces/domain.types';

export class UpdateSystemPartDto {
  @ApiProperty({
    enum: ['NOMINAL', 'WARNING', 'CRITICAL'],
    example: 'WARNING',
    description: 'Nuevo estado de salud de la parte',
  })
  @IsEnum(['NOMINAL', 'WARNING', 'CRITICAL'])
  status: HealthStatus;

  @ApiPropertyOptional({
    description: 'Color hexadecimal de visualización 3D',
    example: '#F59E0B',
  })
  @IsOptional()
  @IsString()
  displayColor?: string;

  @ApiPropertyOptional({
    description: 'Diagnóstico o síntoma asociado',
    example: 'Irritación o espasmo muscular',
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({
    description: 'Nivel de dolor en escala analógica visual 0-10',
    example: 3,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  painLevel?: number;

  @ApiPropertyOptional({
    description: 'Ratio de perfusión o índice local',
    example: 0.85,
  })
  @IsOptional()
  @IsNumber()
  perfusionRatio?: number;

  @ApiPropertyOptional({
    description: 'Temperatura tisular local (°C)',
    example: 37.1,
  })
  @IsOptional()
  @IsNumber()
  localTempC?: number;
}
