import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  ALL_BODY_PART_IDS,
  BodyPartId,
  BODY_PARTS_METADATA,
  CRITICAL_COLOR,
  NOMINAL_COLOR,
  WARNING_COLOR,
} from '../../common/constants/body-parts.constants';
import {
  BodyPartState,
  BodyPartStatusChangedEvent,
  ClinicalRecordAddedEvent,
  HealthStatus,
} from '../../common/interfaces/domain.types';
import { EVENT_STORE, IEventStore } from '../../database/interfaces/event-store.interface';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdatePartStatusDto } from './dto/update-part-status.dto';

@Injectable()
export class BodyPartsService {
  constructor(
    @Inject(EVENT_STORE)
    private readonly eventStore: IEventStore,
  ) {}

  private validatePartId(partId: string): asserts partId is BodyPartId {
    if (!ALL_BODY_PART_IDS.includes(partId as BodyPartId)) {
      throw new BadRequestException(
        `'${partId}' no es una parte anatómica válida del modelo 3D de 49 partes.`,
      );
    }
  }

  private resolveColor(status: HealthStatus, customColor?: string): string {
    if (customColor) return customColor;
    switch (status) {
      case 'CRITICAL':
        return CRITICAL_COLOR;
      case 'WARNING':
        return WARNING_COLOR;
      case 'NOMINAL':
      default:
        return NOMINAL_COLOR;
    }
  }

  /**
   * Devuelve la proyección completa de las 49 partes anatómicas para el render inicial 3D
   */
  async getBodyProjection(astronautId: string) {
    const astronaut = await this.eventStore.getAstronautById(astronautId);
    if (!astronaut) {
      throw new NotFoundException(`Astronauta '${astronautId}' no encontrado.`);
    }

    const parts = await this.eventStore.getBodyProjection(astronautId);

    return {
      astronautId,
      fullName: astronaut.fullName,
      updatedAt: new Date().toISOString(),
      parts,
    };
  }

  /**
   * Obtiene el estado y metadatos de una parte anatómica específica
   */
  async getBodyPart(astronautId: string, partId: string) {
    this.validatePartId(partId);
    const projection = await this.eventStore.getBodyProjection(astronautId);
    const partState = projection[partId];

    if (!partState) {
      throw new NotFoundException(
        `Parte '${partId}' no encontrada en el astronauta '${astronautId}'.`,
      );
    }

    const metadata = BODY_PARTS_METADATA[partId];

    return {
      ...partState,
      metadata,
    };
  }

  /**
   * Obtiene la bitácora histórica de eventos para una parte anatómica
   */
  async getPartHistory(astronautId: string, partId: string) {
    this.validatePartId(partId);
    const events = await this.eventStore.getEventsByPart(astronautId, partId);

    // Ordenar del más reciente al más antiguo
    return events.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }

  /**
   * Modifica el estado clínico y color 3D de una parte anatómica (emite BODY_PART_STATUS_CHANGED)
   */
  async updatePartStatus(
    astronautId: string,
    partId: string,
    dto: UpdatePartStatusDto,
  ) {
    this.validatePartId(partId);
    const astronaut = await this.eventStore.getAstronautById(astronautId);
    if (!astronaut) {
      throw new NotFoundException(`Astronauta '${astronautId}' no encontrado.`);
    }

    const currentProjection = await this.eventStore.getBodyProjection(astronautId);
    const currentPart = currentProjection[partId];

    const displayColor = this.resolveColor(dto.healthStatus, dto.displayColor);
    const activeAlert = dto.activeAlert ?? dto.healthStatus !== 'NOMINAL';

    // 1. Crear evento inmutable de dominio
    const statusChangedEvent: BodyPartStatusChangedEvent = {
      eventId: randomUUID(),
      type: 'BODY_PART_STATUS_CHANGED',
      missionId: astronaut.missionId,
      astronautId,
      timestamp: new Date().toISOString(),
      version: 1,
      payload: {
        partId,
        previousStatus: currentPart.healthStatus,
        newStatus: dto.healthStatus,
        displayColor,
        reason: dto.reason || `Estado actualizado a ${dto.healthStatus}`,
        activeAlert,
      },
    };

    // 2. Persistir en el Event Store
    await this.eventStore.appendEvent(statusChangedEvent);

    // 3. Proyectar nuevo estado en el visor
    const updatedState: BodyPartState = {
      ...currentPart,
      healthStatus: dto.healthStatus,
      displayColor,
      primaryCondition: dto.primaryCondition ?? currentPart.primaryCondition,
      painLevel: dto.painLevel ?? currentPart.painLevel,
      activeAlert,
      lastVitals: dto.lastVitals
        ? { ...currentPart.lastVitals, ...dto.lastVitals }
        : currentPart.lastVitals,
      lastEvaluatedAt: new Date().toISOString(),
    };

    await this.eventStore.updateBodyPartProjection(astronautId, updatedState);

    return {
      success: true,
      event: statusChangedEvent,
      partState: updatedState,
    };
  }

  /**
   * Registra una evaluación clínica, síntoma o intervención (emite CLINICAL_RECORD_ADDED)
   */
  async addMedicalRecord(
    astronautId: string,
    partId: string,
    dto: CreateMedicalRecordDto,
  ) {
    this.validatePartId(partId);
    const astronaut = await this.eventStore.getAstronautById(astronautId);
    if (!astronaut) {
      throw new NotFoundException(`Astronauta '${astronautId}' no encontrado.`);
    }

    const clinicalEvent: ClinicalRecordAddedEvent = {
      eventId: randomUUID(),
      type: 'CLINICAL_RECORD_ADDED',
      missionId: astronaut.missionId,
      astronautId,
      timestamp: new Date().toISOString(),
      version: 1,
      payload: {
        partId,
        recordType: dto.recordType,
        severity: dto.severity,
        title: dto.title,
        description: dto.description,
        treatment: dto.treatment,
        recordedBy: dto.recordedBy || 'Cirujano de Vuelo',
      },
    };

    await this.eventStore.appendEvent(clinicalEvent);

    return {
      success: true,
      recordId: clinicalEvent.eventId,
      event: clinicalEvent,
    };
  }
}
