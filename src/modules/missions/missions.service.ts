import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EVENT_STORE, IEventStore } from '../../database/interfaces/event-store.interface';
import { Astronaut, Mission, RecentUpdate } from '../../common/interfaces/domain.types';

@Injectable()
export class MissionsService {
  constructor(
    @Inject(EVENT_STORE)
    private readonly eventStore: IEventStore,
  ) {}

  async findAll(): Promise<Mission[]> {
    return this.eventStore.getMissions();
  }

  async findOne(id: string): Promise<Mission> {
    const mission = await this.eventStore.getMissionById(id);
    if (!mission) {
      throw new NotFoundException(`Misión con ID '${id}' no encontrada.`);
    }
    return mission;
  }

  async findCrew(missionId: string): Promise<Astronaut[]> {
    await this.findOne(missionId); // Asegura que la misión existe
    return this.eventStore.getAstronautsByMission(missionId);
  }

  async getRecentUpdates(): Promise<RecentUpdate[]> {
    return this.eventStore.getRecentUpdates();
  }
}
