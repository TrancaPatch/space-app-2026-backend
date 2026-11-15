import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AnatomicalSystem } from '../../common/constants/anatomical-systems.constants';
import { BodyPartId } from '../../common/constants/body-parts.constants';
import {
  AnatomicalPartState,
  Astronaut,
  BaseDomainEvent,
  BodyPartState,
  Mission,
  RecentUpdate,
  SystemProjection,
} from '../../common/interfaces/domain.types';
import { IEventStore } from '../interfaces/event-store.interface';
import {
  createNominalSystemParts,
  INITIAL_SEED_DATA,
  SeedData,
} from '../seeds/initial-seed.data';

@Injectable()
export class InMemoryEventStoreProvider implements IEventStore {
  private readonly logger = new Logger(InMemoryEventStoreProvider.name);

  // Almacenamiento en memoria
  private missions: Map<string, Mission> = new Map();
  private astronauts: Map<string, Astronaut> = new Map();
  private events: BaseDomainEvent[] = [];
  private systemProjections: Map<string, SystemProjection> = new Map();
  private recentUpdates: RecentUpdate[] = [];

  constructor(private readonly eventEmitter: EventEmitter2) {
    this.seed();
  }

  /**
   * Guarda un nuevo evento inmutable y notifica a través del EventEmitter interno
   */
  async appendEvent(event: BaseDomainEvent): Promise<void> {
    this.events.push(event);
    this.logger.debug(
      `[EventStore:Memory] Evento agregado: ${event.type} para astronauta ${event.astronautId} (Part: ${(event.payload as any)?.partId || 'N/A'})`,
    );

    // Emitir en el bus interno de NestJS para que gateways y proyecciones reaccionen
    this.eventEmitter.emit(`event.${event.type}`, event);
    this.eventEmitter.emit('domain.event', event);
  }

  async getEventsByAstronaut(astronautId: string): Promise<BaseDomainEvent[]> {
    return this.events.filter((e) => e.astronautId === astronautId);
  }

  async getEventsByPart(astronautId: string, partId: string): Promise<BaseDomainEvent[]> {
    return this.events.filter(
      (e) => e.astronautId === astronautId && (e.payload as any)?.partId === partId,
    );
  }

  /**
   * Obtiene la proyección de cualquiera de los 5 sistemas anatómicos
   */
  async getSystemProjection(
    astronautId: string,
    system: AnatomicalSystem,
  ): Promise<SystemProjection> {
    const key = `${astronautId}_${system}`;
    let projection = this.systemProjections.get(key);

    if (!projection) {
      const now = new Date().toISOString();
      projection = {
        id: key,
        astronautId,
        system,
        updatedAt: now,
        parts: createNominalSystemParts(system, now),
      };
      this.systemProjections.set(key, projection);
    }

    return projection;
  }

  /**
   * Actualiza el estado de una parte dentro de un sistema anatómico específico
   */
  async updateSystemPart(
    astronautId: string,
    system: AnatomicalSystem,
    partState: AnatomicalPartState,
  ): Promise<void> {
    const projection = await this.getSystemProjection(astronautId, system);
    const updatedState: AnatomicalPartState = {
      ...partState,
      lastEvaluatedAt: new Date().toISOString(),
    };

    projection.parts[partState.partId] = updatedState;
    projection.updatedAt = updatedState.lastEvaluatedAt;
    this.systemProjections.set(projection.id, projection);

    // Notificar actualización de parte del sistema
    this.eventEmitter.emit('system_part.updated', {
      astronautId,
      system,
      partState: updatedState,
    });

    // Retrocompatibilidad con suscriptores del cuerpo holográfico
    if (system === 'body') {
      this.eventEmitter.emit('body_part.updated', {
        astronautId,
        partState: updatedState as unknown as BodyPartState,
      });
    }
  }

  /**
   * Retrocompatibilidad: Obtiene la proyección del cuerpo holográfico (49 partes)
   */
  async getBodyProjection(astronautId: string): Promise<Record<string, BodyPartState>> {
    const projection = await this.getSystemProjection(astronautId, 'body');
    return projection.parts as unknown as Record<string, BodyPartState>;
  }

  /**
   * Retrocompatibilidad: Actualiza una parte del cuerpo
   */
  async updateBodyPartProjection(astronautId: string, state: BodyPartState): Promise<void> {
    await this.updateSystemPart(astronautId, 'body', state as unknown as AnatomicalPartState);
  }

  async getMissions(): Promise<Mission[]> {
    return Array.from(this.missions.values());
  }

  async getMissionById(id: string): Promise<Mission | null> {
    return this.missions.get(id) || null;
  }

  async getAstronauts(): Promise<Astronaut[]> {
    return Array.from(this.astronauts.values());
  }

  async getAstronautById(id: string): Promise<Astronaut | null> {
    return this.astronauts.get(id) || null;
  }

  async getAstronautsByMission(missionId: string): Promise<Astronaut[]> {
    return Array.from(this.astronauts.values()).filter((a) => a.missionId === missionId);
  }

  async getRecentUpdates(): Promise<RecentUpdate[]> {
    return this.recentUpdates;
  }

  /**
   * Limpia todo el almacenamiento en memoria
   */
  async clean(): Promise<void> {
    this.missions.clear();
    this.astronauts.clear();
    this.events = [];
    this.systemProjections.clear();
    this.recentUpdates = [];
    this.logger.log('🧹 [EventStore:Memory] Almacenamiento limpiado por completo.');
  }

  /**
   * Pobla el almacenamiento en memoria con datos semilla
   */
  async seed(data: SeedData = INITIAL_SEED_DATA): Promise<void> {
    await this.clean();

    // 1. Misiones
    for (const mission of data.missions) {
      this.missions.set(mission.id, { ...mission });
    }

    // 2. Astronautas
    for (const astronaut of data.astronauts) {
      this.astronauts.set(astronaut.id, { ...astronaut });
    }

    // 3. Proyecciones de Sistemas Anatómicos
    for (const proj of data.systemProjections) {
      const key = proj.id || `${proj.astronautId}_${proj.system}`;
      this.systemProjections.set(key, JSON.parse(JSON.stringify(proj)));
    }

    // 4. Actualizaciones recientes
    this.recentUpdates = [...data.recentUpdates];

    // 5. Eventos
    this.events.push(...data.events.map((e) => ({ ...e })));

    this.logger.log(
      `✅ [EventStore:Memory] Datos semilla cargados (${data.missions.length} misiones, ${data.astronauts.length} astronautas, ${data.systemProjections.length} proyecciones de sistemas, ${data.events.length} eventos).`,
    );
  }
}
