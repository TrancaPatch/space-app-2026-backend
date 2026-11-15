import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  AnatomicalSystem,
  CRITICAL_COLOR,
  NOMINAL_COLOR,
  SYSTEM_PARTS_CATALOG,
  WARNING_COLOR,
} from '../../common/constants/anatomical-systems.constants';
import {
  AnatomicalPartState,
  BaseDomainEvent,
  HealthStatus,
  SystemProjection,
} from '../../common/interfaces/domain.types';
import {
  EVENT_STORE,
  IEventStore,
} from '../../database/interfaces/event-store.interface';
import { UpdateSystemPartDto } from './dto/update-system-part.dto';

@Injectable()
export class AnatomicalSystemsService {
  private readonly logger = new Logger(AnatomicalSystemsService.name);

  constructor(
    @Inject(EVENT_STORE)
    private readonly eventStore: IEventStore,
  ) {}

  private validateSystem(system: string): AnatomicalSystem {
    const validSystems: AnatomicalSystem[] = [
      'body',
      'skeleton',
      'cardiovascular',
      'nervous',
      'organs',
    ];
    if (!validSystems.includes(system as AnatomicalSystem)) {
      throw new BadRequestException(
        `Sistema anatómico inválido: '${system}'. Valores válidos: ${validSystems.join(', ')}`,
      );
    }
    return system as AnatomicalSystem;
  }

  /**
   * Lista todos los sistemas disponibles con resumen de alertas
   */
  async getSystemsOverview(astronautId: string) {
    const systems: AnatomicalSystem[] = [
      'body',
      'skeleton',
      'cardiovascular',
      'nervous',
      'organs',
    ];

    const results = await Promise.all(
      systems.map(async (sys) => {
        const projection = await this.eventStore.getSystemProjection(astronautId, sys);
        const partsList = Object.values(projection.parts || {});
        const alertCount = partsList.filter((p) => p.activeAlert || p.healthStatus !== 'NOMINAL').length;
        const catalog = SYSTEM_PARTS_CATALOG[sys];

        return {
          system: sys,
          name: catalog.name,
          defaultColor: catalog.defaultColor,
          totalParts: catalog.partIds.length,
          alertCount,
          hasAlerts: alertCount > 0,
          updatedAt: projection.updatedAt,
        };
      }),
    );

    return results;
  }

  /**
   * Obtiene la proyección de un sistema anatómico específico
   */
  async getSystemProjection(
    astronautId: string,
    rawSystem: string,
  ): Promise<SystemProjection> {
    const system = this.validateSystem(rawSystem);
    const projection = await this.eventStore.getSystemProjection(astronautId, system);
    return projection;
  }

  /**
   * Obtiene el detalle clínico de una parte de un sistema anatómico
   */
  async getPartDetail(
    astronautId: string,
    rawSystem: string,
    partId: string,
  ) {
    const system = this.validateSystem(rawSystem);
    const projection = await this.eventStore.getSystemProjection(astronautId, system);
    const part = projection.parts[partId];

    if (!part) {
      throw new NotFoundException(
        `Parte '${partId}' no encontrada en el sistema '${system}' para astronauta '${astronautId}'.`,
      );
    }

    const events = await this.eventStore.getEventsByPart(astronautId, partId);

    return {
      part,
      systemMetadata: SYSTEM_PARTS_CATALOG[system],
      recentEvents: events.slice(-5),
    };
  }

  /**
   * Actualiza el estado y color de una parte de un sistema anatómico
   */
  async updatePart(
    astronautId: string,
    rawSystem: string,
    partId: string,
    dto: UpdateSystemPartDto,
  ): Promise<AnatomicalPartState> {
    const system = this.validateSystem(rawSystem);
    const projection = await this.eventStore.getSystemProjection(astronautId, system);
    const currentPart = projection.parts[partId];

    if (!currentPart) {
      throw new NotFoundException(
        `Parte '${partId}' no existe en el sistema '${system}'.`,
      );
    }

    // Resolver color
    const displayColor =
      dto.displayColor || this.resolveStatusColor(dto.status, system);

    // 1. Crear evento inmutable de dominio
    const domainEvent: BaseDomainEvent = {
      eventId: randomUUID(),
      type: 'SYSTEM_PART_STATUS_CHANGED',
      missionId: 'trancapatch-1',
      astronautId,
      timestamp: new Date().toISOString(),
      version: 1,
      payload: {
        system,
        partId,
        previousStatus: currentPart.healthStatus,
        newStatus: dto.status,
        previousColor: currentPart.displayColor,
        newColor: displayColor,
        reason: dto.reason || currentPart.primaryCondition,
        painLevel: dto.painLevel ?? currentPart.painLevel,
      },
    };

    await this.eventStore.appendEvent(domainEvent);

    // 2. Proyectar nuevo estado
    const updatedPart: AnatomicalPartState = {
      ...currentPart,
      healthStatus: dto.status,
      displayColor,
      primaryCondition: dto.reason || currentPart.primaryCondition,
      painLevel: dto.painLevel ?? currentPart.painLevel,
      activeAlert: dto.status === 'WARNING' || dto.status === 'CRITICAL',
      lastVitals: {
        perfusionRatio: dto.perfusionRatio ?? currentPart.lastVitals?.perfusionRatio ?? 1.0,
        localTempC: dto.localTempC ?? currentPart.lastVitals?.localTempC ?? 36.6,
      },
      lastEvaluatedAt: new Date().toISOString(),
    };

    await this.eventStore.updateSystemPart(astronautId, system, updatedPart);

    this.logger.log(
      `[AnatomicalSystems] Parte actualizada: ${astronautId} -> ${system}:${partId} (${dto.status} ${displayColor})`,
    );

    return updatedPart;
  }

  private resolveStatusColor(status: HealthStatus, system: AnatomicalSystem): string {
    switch (status) {
      case 'CRITICAL':
        return CRITICAL_COLOR;
      case 'WARNING':
        return WARNING_COLOR;
      case 'NOMINAL':
      default:
        return system === 'body'
          ? NOMINAL_COLOR
          : SYSTEM_PARTS_CATALOG[system]?.defaultColor || NOMINAL_COLOR;
    }
  }
}
