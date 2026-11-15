import { BodyPartId } from '../constants/body-parts.constants';

export type HealthStatus = 'NOMINAL' | 'WARNING' | 'CRITICAL';

export interface Mission {
  id: string;               // ej. "artemis-iii"
  code: string;             // ej. "ARTEMIS-III"
  name: string;             // ej. "Misión Lunar Tripulada Artemis III"
  environment: 'LEO' | 'LUNAR_SURFACE' | 'DEEP_SPACE' | 'MARS_TRANSIT';
  status: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'ABORTED';
  launchDate: string;       // ISO 8601
  estimatedEndDate: string; // ISO 8601
  crewIds: string[];
  createdAt: string;
}

export interface Astronaut {
  id: string;               // ej. "astro_ripley"
  missionId: string;
  fullName: string;         // ej. "Dra. Ellen Ripley"
  callsign: string;         // ej. "Nostromo-1"
  role: 'COMMANDER' | 'PILOT' | 'MISSION_SPECIALIST' | 'FLIGHT_SURGEON' | 'PAYLOAD_SPECIALIST';
  gender: 'FEMALE' | 'MALE' | 'OTHER';
  age: number;
  bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  baselineVitals: {
    heightCm: number;
    weightKg: number;
    restingHeartRateBpm: number;
    baselineBoneDensityTScore: number;
  };
  overallHealthStatus: 'NOMINAL' | 'MONITORING' | 'CRITICAL';
  updatedAt: string;
}

export interface BodyPartState {
  partId: BodyPartId;       // Uno de los 49 identificadores
  region: string;
  healthStatus: HealthStatus;
  displayColor: string;     // Color HEX: #22C55E (Nominal), #F59E0B (Warning), #EF4444 (Critical)
  primaryCondition: string; // Diagnóstico resumido (ej. "Edema papilar leve - SANS")
  painLevel: number;        // Escala 0 a 10
  lastVitals: Record<string, number | string>;
  activeAlert: boolean;
  lastEvaluatedAt: string;
}

export interface MedicalRecord {
  id: string;
  astronautId: string;
  partId: BodyPartId;
  timestamp: string;
  eventType: 'SYMPTOM' | 'CHECKUP' | 'INCIDENT' | 'TELEMETRY_ALERT' | 'AI_DIAGNOSIS' | 'TREATMENT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  treatmentNotes?: string;
  recordedBy: string;       // ej. "Dr. Marcus Vance (Houston)" o "BioSuit Monitor"
  previousStatus: HealthStatus;
  newStatus: HealthStatus;
}

/**
 * Esquema base para todos los eventos del dominio
 */
export interface BaseDomainEvent<T = Record<string, any>> {
  eventId: string;          // UUID v4
  type: string;             // Discriminador de evento
  missionId: string;
  astronautId: string;
  timestamp: string;        // ISO 8601
  version: number;
  payload: T;
}

export interface TelemetryVitalsPayload {
  partId: BodyPartId;
  sensorId: string;
  vitals: Record<string, number | string>;
}

export type TelemetryVitalsRecordedEvent = BaseDomainEvent<TelemetryVitalsPayload>;

export interface BodyPartStatusChangedPayload {
  partId: BodyPartId;
  previousStatus: HealthStatus;
  newStatus: HealthStatus;
  displayColor: string;
  reason: string;
  activeAlert: boolean;
}

export type BodyPartStatusChangedEvent = BaseDomainEvent<BodyPartStatusChangedPayload>;

export interface ClinicalRecordAddedPayload {
  partId: BodyPartId;
  recordType: 'SYMPTOM' | 'CHECKUP' | 'INCIDENT' | 'TELEMETRY_ALERT' | 'AI_DIAGNOSIS' | 'TREATMENT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  treatment?: string;
  recordedBy: string;
}

export type ClinicalRecordAddedEvent = BaseDomainEvent<ClinicalRecordAddedPayload>;

export interface GeminiDiagnosisPayload {
  affectedParts: BodyPartId[];
  diagnosis: string;
  gravityRiskFactor: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  countermeasures: string[];
  urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidenceScore: number;
}

export type GeminiDiagnosisGeneratedEvent = BaseDomainEvent<GeminiDiagnosisPayload>;
