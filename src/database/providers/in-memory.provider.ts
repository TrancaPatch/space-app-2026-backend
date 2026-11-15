import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  BodyPartId,
} from '../../common/constants/body-parts.constants';
import {
  Astronaut,
  BaseDomainEvent,
  BodyPartState,
  Mission,
} from '../../common/interfaces/domain.types';
import { IEventStore } from '../interfaces/event-store.interface';
import {
  createNominalBodyProjection,
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
  private bodyProjections: Map<string, Record<BodyPartId, BodyPartState>> = new Map();

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

  async getEventsByPart(astronautId: string, partId: BodyPartId): Promise<BaseDomainEvent[]> {
    return this.events.filter(
      (e) => e.astronautId === astronautId && (e.payload as any)?.partId === partId,
    );
  }

  async getBodyProjection(astronautId: string): Promise<Record<BodyPartId, BodyPartState>> {
    const projection = this.bodyProjections.get(astronautId);
    if (!projection) {
      // Si no existe, inicializar con estado nominal para todas las 49 partes
      const newProjection = createNominalBodyProjection();
      this.bodyProjections.set(astronautId, newProjection);
      return newProjection;
    }
    return projection;
  }

  async updateBodyPartProjection(astronautId: string, state: BodyPartState): Promise<void> {
    const current = await this.getBodyProjection(astronautId);
    current[state.partId] = {
      ...state,
      lastEvaluatedAt: new Date().toISOString(),
    };
    this.bodyProjections.set(astronautId, current);

    // Notificar actualización de parte en tiempo real
    this.eventEmitter.emit('body_part.updated', {
      astronautId,
      partState: current[state.partId],
    });
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

  /**
   * Limpia todo el almacenamiento en memoria
   */
  async clean(): Promise<void> {
    this.missions.clear();
    this.astronauts.clear();
    this.events = [];
    this.bodyProjections.clear();
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

    // 3. Proyecciones
    for (const [astronautId, projection] of Object.entries(data.bodyProjections)) {
      this.bodyProjections.set(astronautId, { ...projection });
    }

    // 4. Eventos
    this.events.push(...data.events.map((e) => ({ ...e })));

    this.logger.log(
      `✅ [EventStore:Memory] Datos semilla cargados (${data.missions.length} misiones, ${data.astronauts.length} astronautas, ${data.events.length} eventos).`,
    );
  }
}
