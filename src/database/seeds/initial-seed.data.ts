import {
  ALL_BODY_PART_IDS,
  BodyPartId,
  BODY_PARTS_METADATA,
  NOMINAL_COLOR,
  WARNING_COLOR,
} from '../../common/constants/body-parts.constants';
import {
  Astronaut,
  BaseDomainEvent,
  BodyPartState,
  Mission,
} from '../../common/interfaces/domain.types';

export interface SeedData {
  missions: Mission[];
  astronauts: Astronaut[];
  bodyProjections: Record<string, Record<BodyPartId, BodyPartState>>;
  events: BaseDomainEvent[];
}

/**
 * Crea una proyección nominal por defecto para las 49 partes anatómicas
 */
export function createNominalBodyProjection(timestamp = '2026-11-14T10:00:00Z'): Record<BodyPartId, BodyPartState> {
  const projection = {} as Record<BodyPartId, BodyPartState>;

  for (const partId of ALL_BODY_PART_IDS) {
    const meta = BODY_PARTS_METADATA[partId];
    projection[partId] = {
      partId,
      region: meta.region,
      healthStatus: 'NOMINAL',
      displayColor: NOMINAL_COLOR,
      primaryCondition: 'Nominal',
      painLevel: 0,
      lastVitals: {
        tissuePerfusionIndex: 1.0,
        localTempC: 36.6,
      },
      activeAlert: false,
      lastEvaluatedAt: timestamp,
    };
  }

  return projection;
}

const ripleyBodyProjection = createNominalBodyProjection();

// Anomalía 1 precargada: OjoDer (SANS Grado 1)
ripleyBodyProjection.OjoDer = {
  partId: 'OjoDer',
  region: 'Cabeza y Cuello',
  healthStatus: 'WARNING',
  displayColor: WARNING_COLOR,
  primaryCondition: 'Edema papilar incipiente - SANS Grado 1',
  painLevel: 2,
  lastVitals: {
    intraocularPressureMmHg: 22.4,
    visualAcuity: '20/40',
    venousEngorgement: 'Mild',
  },
  activeAlert: true,
  lastEvaluatedAt: '2026-11-14T11:20:00Z',
};

// Anomalía 2 precargada: MusloDer (Microdesgarro muscular por EVA)
ripleyBodyProjection.MusloDer = {
  partId: 'MusloDer',
  region: 'Pierna Derecha',
  healthStatus: 'WARNING',
  displayColor: WARNING_COLOR,
  primaryCondition: 'Microdesgarro muscular leve por EVA prolongada',
  painLevel: 3,
  lastVitals: {
    muscleFatigueIndex: 78,
    localSkinTempC: 37.8,
    perfusionRatio: 0.88,
  },
  activeAlert: true,
  lastEvaluatedAt: '2026-11-14T12:10:00Z',
};

const watneyBodyProjection = createNominalBodyProjection();

export const INITIAL_SEED_DATA: SeedData = {
  missions: [
    {
      id: 'artemis-iii',
      code: 'ARTEMIS-III',
      name: 'Misión Lunar Tripulada Artemis III',
      environment: 'LUNAR_SURFACE',
      status: 'ACTIVE',
      launchDate: '2026-09-15T08:00:00Z',
      estimatedEndDate: '2026-10-15T18:00:00Z',
      crewIds: ['astro_ripley', 'astro_watney'],
      createdAt: '2026-09-01T00:00:00Z',
    },
  ],
  astronauts: [
    {
      id: 'astro_ripley',
      missionId: 'artemis-iii',
      fullName: 'Dra. Ellen Ripley',
      callsign: 'Nostromo-1',
      role: 'FLIGHT_SURGEON',
      gender: 'FEMALE',
      age: 38,
      bloodType: 'O+',
      baselineVitals: {
        heightCm: 172,
        weightKg: 64,
        restingHeartRateBpm: 68,
        baselineBoneDensityTScore: 0.2,
      },
      overallHealthStatus: 'MONITORING',
      updatedAt: '2026-11-14T12:10:00Z',
    },
    {
      id: 'astro_watney',
      missionId: 'artemis-iii',
      fullName: 'Cmdr. Mark Watney',
      callsign: 'Ares-3',
      role: 'COMMANDER',
      gender: 'MALE',
      age: 42,
      bloodType: 'A+',
      baselineVitals: {
        heightCm: 180,
        weightKg: 78,
        restingHeartRateBpm: 72,
        baselineBoneDensityTScore: 0.1,
      },
      overallHealthStatus: 'NOMINAL',
      updatedAt: '2026-11-14T10:00:00Z',
    },
  ],
  bodyProjections: {
    astro_ripley: ripleyBodyProjection,
    astro_watney: watneyBodyProjection,
  },
  events: [
    {
      eventId: 'evt-001',
      type: 'TELEMETRY_VITALS_RECORDED',
      missionId: 'artemis-iii',
      astronautId: 'astro_ripley',
      timestamp: '2026-11-14T10:00:00Z',
      version: 1,
      payload: {
        partId: 'Pecho',
        sensorId: 'BioSuit_ECG_Lead_II',
        vitals: { heartRateBpm: 72, spo2: 98, respiratoryRate: 15, coreTempC: 36.8 },
      },
    },
    {
      eventId: 'evt-002',
      type: 'BODY_PART_STATUS_CHANGED',
      missionId: 'artemis-iii',
      astronautId: 'astro_ripley',
      timestamp: '2026-11-14T11:15:00Z',
      version: 1,
      payload: {
        partId: 'OjoDer',
        previousStatus: 'NOMINAL',
        newStatus: 'WARNING',
        displayColor: WARNING_COLOR,
        reason: 'Presión intraocular elevada detectada post-actividad extravehicular (22.4 mmHg).',
        activeAlert: true,
      },
    },
    {
      eventId: 'evt-003',
      type: 'CLINICAL_RECORD_ADDED',
      missionId: 'artemis-iii',
      astronautId: 'astro_ripley',
      timestamp: '2026-11-14T11:20:00Z',
      version: 1,
      payload: {
        partId: 'OjoDer',
        recordType: 'CHECKUP',
        severity: 'MEDIUM',
        title: 'Examen oftalmológico por biomonitor ocular',
        description: 'Aplanamiento ligero del polo posterior compatible con SANS grado 1.',
        treatment: 'Reducción de esfuerzo cefálico y monitorización en 12h.',
        recordedBy: 'BioSuit Autonomous Telemetry',
      },
    },
    {
      eventId: 'evt-004',
      type: 'BODY_PART_STATUS_CHANGED',
      missionId: 'artemis-iii',
      astronautId: 'astro_ripley',
      timestamp: '2026-11-14T12:00:00Z',
      version: 1,
      payload: {
        partId: 'MusloDer',
        previousStatus: 'NOMINAL',
        newStatus: 'WARNING',
        displayColor: WARNING_COLOR,
        reason: 'Sobrecarga biomecánica en cuadríceps derecho tras caminata lunar con regolito pesado.',
        activeAlert: true,
      },
    },
    {
      eventId: 'evt-005',
      type: 'CLINICAL_RECORD_ADDED',
      missionId: 'artemis-iii',
      astronautId: 'astro_ripley',
      timestamp: '2026-11-14T12:10:00Z',
      version: 1,
      payload: {
        partId: 'MusloDer',
        recordType: 'INCIDENT',
        severity: 'MEDIUM',
        title: 'Fatiga y dolor muscular localizado (Escala 3/10)',
        description: 'Microdesgarro fibrilar en cuádriceps derecho durante EVA de 5 horas.',
        treatment: 'Compresión térmica pasiva y descanso neuromuscular.',
        recordedBy: 'Dra. Ellen Ripley (Autoevaluación)',
      },
    },
  ],
};
