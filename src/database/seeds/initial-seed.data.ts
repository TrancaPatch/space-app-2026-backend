import {
  AnatomicalSystem,
  NOMINAL_COLOR,
  SYSTEM_PARTS_CATALOG,
  WARNING_COLOR,
} from '../../common/constants/anatomical-systems.constants';
import {
  AnatomicalPartState,
  Astronaut,
  BaseDomainEvent,
  Mission,
  RecentUpdate,
  SystemProjection,
} from '../../common/interfaces/domain.types';

export interface SeedData {
  missions: Mission[];
  astronauts: Astronaut[];
  systemProjections: SystemProjection[];
  recentUpdates: RecentUpdate[];
  events: BaseDomainEvent[];
}

/**
 * Genera el estado nominal para todas las partes de un sistema anatómico dado
 */
export function createNominalSystemParts(
  system: AnatomicalSystem,
  timestamp = '2026-11-15T00:00:00Z',
): Record<string, AnatomicalPartState> {
  const catalog = SYSTEM_PARTS_CATALOG[system];
  const parts: Record<string, AnatomicalPartState> = {};

  for (const partId of catalog.partIds) {
    parts[partId] = {
      partId,
      label: partId,
      system,
      region: catalog.name,
      healthStatus: 'NOMINAL',
      displayColor: system === 'body' ? NOMINAL_COLOR : catalog.defaultColor,
      primaryCondition: 'Nominal',
      painLevel: 0,
      lastVitals: {
        perfusionRatio: 1.0,
        localTempC: 36.6,
      },
      activeAlert: false,
      lastEvaluatedAt: timestamp,
    };
  }

  return parts;
}

export function createNominalBodyProjection(
  timestamp = '2026-11-15T00:00:00Z',
): Record<string, AnatomicalPartState> {
  return createNominalSystemParts('body', timestamp);
}

/**
 * Genera la proyección completa de los 5 sistemas para un astronauta
 */
function createFullAstronautProjections(astronautId: string): SystemProjection[] {
  const systems: AnatomicalSystem[] = ['body', 'skeleton', 'cardiovascular', 'nervous', 'organs'];
  const now = '2026-11-15T00:00:00Z';

  return systems.map((system) => ({
    id: `${astronautId}_${system}`,
    astronautId,
    system,
    updatedAt: now,
    parts: createNominalSystemParts(system, now),
  }));
}

// 1. Proyecciones para Astronauta 1: Ariel Y. (Capitán)
const arielProjections = createFullAstronautProjections('1');
const arielBody = arielProjections.find((p) => p.system === 'body')!;
const arielOrgans = arielProjections.find((p) => p.system === 'organs')!;

// Síntoma 1: Radiación UV moderada (Pecho y Torso)
if (arielBody.parts.Pecho) {
  arielBody.parts.Pecho.healthStatus = 'WARNING';
  arielBody.parts.Pecho.displayColor = WARNING_COLOR;
  arielBody.parts.Pecho.primaryCondition = 'Exposición a Radiación UV moderada';
  arielBody.parts.Pecho.activeAlert = true;
  arielBody.parts.Pecho.painLevel = 2;
}
if (arielBody.parts.Torso) {
  arielBody.parts.Torso.healthStatus = 'WARNING';
  arielBody.parts.Torso.displayColor = WARNING_COLOR;
  arielBody.parts.Torso.primaryCondition = 'Eritema cutáneo por radiación UV';
  arielBody.parts.Torso.activeAlert = true;
  arielBody.parts.Torso.painLevel = 1;
}

// Síntoma 2: Tos (Pulmones)
if (arielOrgans.parts.Pulmones) {
  arielOrgans.parts.Pulmones.healthStatus = 'WARNING';
  arielOrgans.parts.Pulmones.displayColor = WARNING_COLOR;
  arielOrgans.parts.Pulmones.primaryCondition = 'Tos seca irritativa / broncospasmo leve';
  arielOrgans.parts.Pulmones.activeAlert = true;
  arielOrgans.parts.Pulmones.painLevel = 2;
}

// 2. Proyecciones para Astronauta 2: Manuel J. (Tripulante)
const manuelProjections = createFullAstronautProjections('2');
const manuelSkeleton = manuelProjections.find((p) => p.system === 'skeleton')!;
const manuelBody = manuelProjections.find((p) => p.system === 'body')!;

// Síntoma 1: Pérdida ósea (FemurDer y Columna)
if (manuelSkeleton.parts.FemurDer) {
  manuelSkeleton.parts.FemurDer.healthStatus = 'WARNING';
  manuelSkeleton.parts.FemurDer.displayColor = WARNING_COLOR;
  manuelSkeleton.parts.FemurDer.primaryCondition = 'Desmineralización ósea trabecular';
  manuelSkeleton.parts.FemurDer.activeAlert = true;
  manuelSkeleton.parts.FemurDer.painLevel = 1;
}
if (manuelSkeleton.parts.VertebraLumbar4) {
  manuelSkeleton.parts.VertebraLumbar4.healthStatus = 'WARNING';
  manuelSkeleton.parts.VertebraLumbar4.displayColor = WARNING_COLOR;
  manuelSkeleton.parts.VertebraLumbar4.primaryCondition = 'Molestia lumbar postural en microgravedad';
  manuelSkeleton.parts.VertebraLumbar4.activeAlert = true;
  manuelSkeleton.parts.VertebraLumbar4.painLevel = 2;
}

// Síntoma 2: Dolor en el dedo gordo del pie (DP1_Der y Distal1_Der)
if (manuelBody.parts.DP1_Der) {
  manuelBody.parts.DP1_Der.healthStatus = 'WARNING';
  manuelBody.parts.DP1_Der.displayColor = WARNING_COLOR;
  manuelBody.parts.DP1_Der.primaryCondition = 'Dolor en dedo gordo pie derecho';
  manuelBody.parts.DP1_Der.activeAlert = true;
  manuelBody.parts.DP1_Der.painLevel = 4;
}
if (manuelSkeleton.parts.Distal1_Der) {
  manuelSkeleton.parts.Distal1_Der.healthStatus = 'WARNING';
  manuelSkeleton.parts.Distal1_Der.displayColor = WARNING_COLOR;
  manuelSkeleton.parts.Distal1_Der.primaryCondition = 'Inflamación articular falange distal 1';
  manuelSkeleton.parts.Distal1_Der.activeAlert = true;
  manuelSkeleton.parts.Distal1_Der.painLevel = 4;
}

// 3. Proyecciones para Astronauta 3: Ignacio Y. (Tripulante)
const ignacioProjections = createFullAstronautProjections('3');
const ignacioCardio = ignacioProjections.find((p) => p.system === 'cardiovascular')!;
const ignacioOrgans = ignacioProjections.find((p) => p.system === 'organs')!;

// Síntoma 1: Baja saturación de oxígeno (Corazón y Vasos Pulmonares)
if (ignacioCardio.parts.Corazon) {
  ignacioCardio.parts.Corazon.healthStatus = 'WARNING';
  ignacioCardio.parts.Corazon.displayColor = WARNING_COLOR;
  ignacioCardio.parts.Corazon.primaryCondition = 'Baja saturación de O2 sistémico (93%)';
  ignacioCardio.parts.Corazon.activeAlert = true;
  ignacioCardio.parts.Corazon.painLevel = 1;
}
if (ignacioCardio.parts.PulmonarDer1) {
  ignacioCardio.parts.PulmonarDer1.healthStatus = 'WARNING';
  ignacioCardio.parts.PulmonarDer1.displayColor = WARNING_COLOR;
  ignacioCardio.parts.PulmonarDer1.primaryCondition = 'Flujo capilar pulmonar reducido';
  ignacioCardio.parts.PulmonarDer1.activeAlert = true;
}

// Síntoma 2: Dolor de estómago (Digestivo)
if (ignacioOrgans.parts.Digestivo) {
  ignacioOrgans.parts.Digestivo.healthStatus = 'WARNING';
  ignacioOrgans.parts.Digestivo.displayColor = WARNING_COLOR;
  ignacioOrgans.parts.Digestivo.primaryCondition = 'Dispepsia y dolor gástrico espasmódico';
  ignacioOrgans.parts.Digestivo.activeAlert = true;
  ignacioOrgans.parts.Digestivo.painLevel = 3;
}

export const INITIAL_SEED_DATA: SeedData = {
  missions: [
    {
      id: 'trancapatch-1',
      code: 'TRANCAPATCH-1',
      name: 'Misión Espacial Trancapatch',
      title: 'Misión Espacial Trancapatch',
      appName: 'App',
      environment: 'LEO',
      status: 'ACTIVE',
      launchDate: '2026-11-01T00:00:00Z',
      estimatedEndDate: '2026-12-01T00:00:00Z',
      crewIds: ['1', '2', '3'],
      createdAt: '2026-11-01T00:00:00Z',
    },
  ],
  astronauts: [
    {
      id: '1',
      missionId: 'trancapatch-1',
      fullName: 'Ariel Y.',
      name: 'Ariel Y.',
      callsign: 'Capitán',
      role: 'Capitán',
      avatar: '/avatars/ariel.jpg',
      bloodType: 'A+',
      height: '168 cm',
      weight: '74 kg',
      pulse: '76 bpm',
      pressure: '120/80',
      symptoms: ['Radiación UV moderada', 'Tos'],
      baselineVitals: {
        heightCm: 168,
        weightKg: 74,
        restingHeartRateBpm: 76,
        baselineBoneDensityTScore: 0.1,
      },
      overallHealthStatus: 'MONITORING',
      updatedAt: '2026-11-15T00:00:00Z',
    },
    {
      id: '2',
      missionId: 'trancapatch-1',
      fullName: 'Manuel J.',
      name: 'Manuel J.',
      callsign: 'Tripulante',
      role: 'Tripulante',
      avatar: '/avatars/manuel.jpg',
      bloodType: 'O+',
      height: '168 cm',
      weight: '74 kg',
      pulse: '76 bpm',
      pressure: '120/80',
      symptoms: ['Perdida ósea', 'Dolor en el dedo gordo del pie'],
      baselineVitals: {
        heightCm: 168,
        weightKg: 74,
        restingHeartRateBpm: 76,
        baselineBoneDensityTScore: -1.2,
      },
      overallHealthStatus: 'MONITORING',
      updatedAt: '2026-11-15T00:00:00Z',
    },
    {
      id: '3',
      missionId: 'trancapatch-1',
      fullName: 'Ignacio Y.',
      name: 'Ignacio Y.',
      callsign: 'Tripulante',
      role: 'Tripulante',
      avatar: '/avatars/ignacio.jpg',
      bloodType: 'O-',
      height: '168 cm',
      weight: '74 kg',
      pulse: '76 bpm',
      pressure: '120/80',
      symptoms: ['Baja saturación de oxígeno', 'Dolor de estómago'],
      baselineVitals: {
        heightCm: 168,
        weightKg: 74,
        restingHeartRateBpm: 76,
        baselineBoneDensityTScore: 0.0,
      },
      overallHealthStatus: 'MONITORING',
      updatedAt: '2026-11-15T00:00:00Z',
    },
  ],
  systemProjections: [
    ...arielProjections,
    ...manuelProjections,
    ...ignacioProjections,
  ],
  recentUpdates: [
    {
      id: '1',
      date: '10/11/26',
      crewMember: 'Ariel Y.',
      astronautId: '1',
      notification: 'Radiación UV moderada',
      status: 'Añadido',
      pulse: '76 BPM',
      pressure: '120/80',
    },
    {
      id: '2',
      date: '10/11/26',
      crewMember: 'Manuel J.',
      astronautId: '2',
      notification: 'Dolor en el dedo gordo del pie',
      status: 'Añadido',
      pulse: '76 BPM',
      pressure: '120/80',
    },
    {
      id: '3',
      date: '09/11/26',
      crewMember: 'Ignacio Y.',
      astronautId: '3',
      notification: 'Dolor de estómago',
      status: 'Añadido',
      pulse: '76 BPM',
      pressure: '120/80',
    },
    {
      id: '4',
      date: '09/11/26',
      crewMember: 'Ariel Y.',
      astronautId: '1',
      notification: 'Dolor de cabeza',
      status: 'Removido',
      pulse: '76 BPM',
      pressure: '120/80',
    },
    {
      id: '5',
      date: '08/11/26',
      crewMember: 'Manuel J.',
      astronautId: '2',
      notification: 'Fiebre',
      status: 'Removido',
      pulse: '76 BPM',
      pressure: '120/80',
    },
  ],
  events: [
    {
      eventId: 'evt-001',
      type: 'CLINICAL_RECORD_ADDED',
      missionId: 'trancapatch-1',
      astronautId: '1',
      timestamp: '2026-11-10T10:00:00Z',
      version: 1,
      payload: {
        partId: 'Pecho',
        system: 'body',
        recordType: 'TELEMETRY_ALERT',
        severity: 'MEDIUM',
        title: 'Radiación UV moderada detectada',
        description: 'Dosímetro pectoral registra radiación UV acumulada sobre el umbral.',
        recordedBy: 'BioSuit Dosimetry',
      },
    },
    {
      eventId: 'evt-002',
      type: 'CLINICAL_RECORD_ADDED',
      missionId: 'trancapatch-1',
      astronautId: '2',
      timestamp: '2026-11-10T12:00:00Z',
      version: 1,
      payload: {
        partId: 'DP1_Der',
        system: 'body',
        recordType: 'SYMPTOM',
        severity: 'MEDIUM',
        title: 'Dolor en el dedo gordo del pie derecho',
        description: 'Dolor de presión (escala 4/10) al contacto con la bota presurizada.',
        recordedBy: 'Manuel J. (Reporte)',
      },
    },
    {
      eventId: 'evt-003',
      type: 'CLINICAL_RECORD_ADDED',
      missionId: 'trancapatch-1',
      astronautId: '3',
      timestamp: '2026-11-09T14:00:00Z',
      version: 1,
      payload: {
        partId: 'Digestivo',
        system: 'organs',
        recordType: 'SYMPTOM',
        severity: 'MEDIUM',
        title: 'Dolor de estómago / molestia gástrica',
        description: 'Espasmos leves atribuibles a adaptación a alimentos en microgravedad.',
        recordedBy: 'Ignacio Y. (Reporte)',
      },
    },
  ],
};
