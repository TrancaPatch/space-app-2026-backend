import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMedicalRecordDto {
  @ApiProperty({
    description: 'Tipo de evento clínico o intervención',
    enum: ['SYMPTOM', 'CHECKUP', 'INCIDENT', 'TELEMETRY_ALERT', 'AI_DIAGNOSIS', 'TREATMENT'],
    example: 'CHECKUP',
  })
  @IsEnum(['SYMPTOM', 'CHECKUP', 'INCIDENT', 'TELEMETRY_ALERT', 'AI_DIAGNOSIS', 'TREATMENT'])
  recordType: 'SYMPTOM' | 'CHECKUP' | 'INCIDENT' | 'TELEMETRY_ALERT' | 'AI_DIAGNOSIS' | 'TREATMENT';

  @ApiProperty({
    description: 'Severidad del evento',
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    example: 'MEDIUM',
  })
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  @ApiProperty({
    description: 'Título conciso del registro médico',
    example: 'Examen de agudeza visual post-EVA',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Descripción detallada de la evaluación clínica o síntoma',
    example: 'Visión borrosa leve en cuadrante inferior del ojo derecho.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({
    description: 'Tratamiento, contramedida o prescripción indicada',
    example: 'LBNP (Lower Body Negative Pressure) por 30 minutos.',
  })
  @IsOptional()
  @IsString()
  treatment?: string;

  @ApiPropertyOptional({
    description: 'Profesional o sistema que registra el evento',
    example: 'Dr. Marcus Vance (Houston Flight Surgeon)',
  })
  @IsOptional()
  @IsString()
  recordedBy?: string;
}
