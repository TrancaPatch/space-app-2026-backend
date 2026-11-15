import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EVENT_STORE, IEventStore } from '../../database/interfaces/event-store.interface';
import { Astronaut } from '../../common/interfaces/domain.types';

@Injectable()
export class AstronautsService {
  constructor(
    @Inject(EVENT_STORE)
    private readonly eventStore: IEventStore,
  ) {}

  async findAll(): Promise<Astronaut[]> {
    return this.eventStore.getAstronauts();
  }

  async findOne(id: string): Promise<Astronaut> {
    const astronaut = await this.eventStore.getAstronautById(id);
    if (!astronaut) {
      throw new NotFoundException(`Astronauta con ID '${id}' no encontrado.`);
    }
    return astronaut;
  }

  async getVitals(id: string): Promise<Record<string, any>> {
    const astronaut = await this.findOne(id);
    const projection = await this.eventStore.getBodyProjection(id);

    // Extraer telemetría reciente de Pecho (tórax/corazón) y Torso (temperatura/abdomen)
    const chestVitals = projection.Pecho?.lastVitals || {};
    const torsoVitals = projection.Torso?.lastVitals || {};

    return {
      astronautId: astronaut.id,
      fullName: astronaut.fullName,
      callsign: astronaut.callsign,
      overallHealthStatus: astronaut.overallHealthStatus,
      heartRateBpm: chestVitals.heartRateBpm ?? astronaut.baselineVitals.restingHeartRateBpm,
      spo2Percent: chestVitals.spo2 ?? 98,
      respiratoryRateBpm: chestVitals.respiratoryRate ?? 14,
      coreTemperatureC: torsoVitals.coreTempC ?? chestVitals.coreTempC ?? 36.8,
      bloodPressureSystolic: 118,
      bloodPressureDiastolic: 76,
      accumulatedRadiationMilliSv: 14.2,
      activeAlertsCount: Object.values(projection).filter((p) => p.activeAlert).length,
      evaluatedAt: new Date().toISOString(),
    };
  }
}
