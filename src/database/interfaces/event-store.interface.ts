import { BodyPartId } from '../../common/constants/body-parts.constants';
import {
  Astronaut,
  BaseDomainEvent,
  BodyPartState,
  Mission,
} from '../../common/interfaces/domain.types';
import { SeedData } from '../seeds/initial-seed.data';

export const EVENT_STORE = 'EVENT_STORE';

export interface IEventStore {
  /**
   * Guarda un nuevo evento inmutable en el Event Store
   */
  appendEvent(event: BaseDomainEvent): Promise<void>;

  /**
   * Obtiene todos los eventos asociados a un astronauta ordenados cronológicamente
   */
  getEventsByAstronaut(astronautId: string): Promise<BaseDomainEvent[]>;

  /**
   * Obtiene la bitácora histórica de eventos para una parte anatómica específica
   */
  getEventsByPart(astronautId: string, partId: BodyPartId): Promise<BaseDomainEvent[]>;

  /**
   * Obtiene la proyección actual del estado de las 49 partes del cuerpo del astronauta
   */
  getBodyProjection(astronautId: string): Promise<Record<BodyPartId, BodyPartState>>;

  /**
   * Actualiza la proyección en tiempo real de una parte del cuerpo
   */
  updateBodyPartProjection(astronautId: string, state: BodyPartState): Promise<void>;

  /**
   * Lista todas las misiones registradas
   */
  getMissions(): Promise<Mission[]>;

  /**
   * Obtiene el detalle de una misión por ID
   */
  getMissionById(id: string): Promise<Mission | null>;

  /**
   * Lista todos los astronautas registrados
   */
  getAstronauts(): Promise<Astronaut[]>;

  /**
   * Obtiene la ficha de un astronauta por ID
   */
  getAstronautById(id: string): Promise<Astronaut | null>;

  /**
   * Obtiene la tripulación asignada a una misión específica
   */
  getAstronautsByMission(missionId: string): Promise<Astronaut[]>;

  /**
   * Carga datos semilla en el almacenamiento
   */
  seed(data?: SeedData): Promise<void>;

  /**
   * Limpia todos los eventos y datos del almacenamiento
   */
  clean(): Promise<void>;
}
