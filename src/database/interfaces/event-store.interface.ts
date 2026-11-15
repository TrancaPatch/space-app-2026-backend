import { BodyPartId } from '../../common/constants/body-parts.constants';
import { AnatomicalSystem } from '../../common/constants/anatomical-systems.constants';
import {
  AnatomicalPartState,
  Astronaut,
  BaseDomainEvent,
  BodyPartState,
  Mission,
  RecentUpdate,
  SystemProjection,
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
  getEventsByPart(astronautId: string, partId: string): Promise<BaseDomainEvent[]>;

  /**
   * Obtiene la proyección de cualquiera de los 5 sistemas anatómicos (body, skeleton, cardiovascular, nervous, organs)
   */
  getSystemProjection(astronautId: string, system: AnatomicalSystem): Promise<SystemProjection>;

  /**
   * Actualiza el estado y color de una parte de un sistema anatómico específico
   */
  updateSystemPart(astronautId: string, system: AnatomicalSystem, partState: AnatomicalPartState): Promise<void>;

  /**
   * Retrocompatibilidad: Obtiene la proyección de las 49 partes del cuerpo
   */
  getBodyProjection(astronautId: string): Promise<Record<string, BodyPartState>>;

  /**
   * Retrocompatibilidad: Actualiza una parte del cuerpo holográfico
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
   * Obtiene las actualizaciones recientes de la misión para el dashboard
   */
  getRecentUpdates(): Promise<RecentUpdate[]>;

  /**
   * Carga datos semilla en el almacenamiento
   */
  seed(data?: SeedData): Promise<void>;

  /**
   * Limpia todos los eventos y datos del almacenamiento
   */
  clean(): Promise<void>;
}
