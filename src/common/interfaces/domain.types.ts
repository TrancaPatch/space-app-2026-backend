import { BodyPartId } from '../constants/body-parts.constants';
import { AnatomicalSystem } from '../constants/anatomical-systems.constants';

export type HealthStatus = 'NOMINAL' | 'WARNING' | 'CRITICAL';

export interface Mission {
  id: string;               // ej. "trancapatch-1"
  code: string;             // ej. "TRANCAPATCH-1"
  name: string;             // ej. "Misión Espacial Trancapatch"
  title?: string;           // Para frontend: "Misión Espacial Trancapatch"
  appName?: string;         // Para frontend: "App"
  environment: 'LEO' | 'LUNAR_SURFACE' | 'DEEP_SPACE' | 'MARS_TRANSIT';
  status: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'ABORTED';
  launchDate: string;       // ISO 8601
  estimatedEndDate: string; // ISO 8601
  crewIds: string[];
  createdAt: string;
}

export interface Astronaut {
  id: string;               // "1", "2", "3"
  missionId: string;
  fullName: string;         // "Ariel Y."
  name?: string;            // Para frontend ("Ariel Y.")
  callsign: string;         // "Capitán"
  role: string;             // "Capitán" | "Tripulante" | 'COMMANDER' | ...
  avatar: string;           // "/avatars/ariel.jpg"
  gender?: 'FEMALE' | 'MALE' | 'OTHER';
  age?: number;
  bloodType: string;        // "A+", "O+", "O-"
  height?: string;          // "168 cm"
  weight?: string;          // "74 kg"
  pulse?: string;           // "76 bpm"
  pressure?: string;        // "120/80"
  symptoms?: string[];      // ["Radiación UV moderada", "Tos"]
  baselineVitals: {
    heightCm: number;
    weightKg: number;
    restingHeartRateBpm: number;
    baselineBoneDensityTScore: number;
  };
  overallHealthStatus: 'NOMINAL' | 'MONITORING' | 'CRITICAL';
  updatedAt: string;
}

export interface AnatomicalPartState {
  partId: string;           // Identificador de la parte / hueso / vaso / órgano
  label: string;            // Nombre legible (ej. "Fémur Derecho", "Corazón")
  system: AnatomicalSystem; // 'body' | 'skeleton' | 'cardiovascular' | 'nervous' | 'organs'
  region: string;           // Región anatómica
  healthStatus: HealthStatus;
  displayColor: string;     // Color HEX: #22C55E (Nominal), #38BDF8 (Selected), #F59E0B (Warning), #EF4444 (Critical)
  primaryCondition: string; // Diagnóstico resumido
  painLevel: number;        // Escala 0 a 10
  lastVitals: Record<string, number | string>;
  activeAlert: boolean;
  lastEvaluatedAt: string;
}

export interface SystemProjection {
  id: string;               // ej. "1_skeleton"
  astronautId: string;      // ej. "1"
  system: AnatomicalSystem;
  updatedAt: string;
  parts: Record<string, AnatomicalPartState>;
}

// Retrocompatibilidad con BodyPartState
export type BodyPartState = AnatomicalPartState;

export interface MedicalRecord {
  id: string;
  astronautId: string;
  partId: string;
  system?: AnatomicalSystem;
  timestamp: string;
  eventType: 'SYMPTOM' | 'CHECKUP' | 'INCIDENT' | 'TELEMETRY_ALERT' | 'AI_DIAGNOSIS' | 'TREATMENT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  treatmentNotes?: string;
  recordedBy: string;
  previousStatus: HealthStatus;
  newStatus: HealthStatus;
}

export interface RecentUpdate {
  id: string;
  date: string;
  crewMember: string;
  astronautId: string;
  notification: string;
  status: 'Añadido' | 'Removido';
  pulse: string;
  pressure: string;
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
  partId: string;
  sensorId: string;
  vitals: Record<string, number | string>;
}

export type TelemetryVitalsRecordedEvent = BaseDomainEvent<TelemetryVitalsPayload>;

export interface BodyPartStatusChangedPayload {
  partId: string;
  system?: AnatomicalSystem;
  previousStatus: HealthStatus;
  newStatus: HealthStatus;
  displayColor: string;
  reason: string;
  activeAlert: boolean;
}

export type BodyPartStatusChangedEvent = BaseDomainEvent<BodyPartStatusChangedPayload>;

export interface ClinicalRecordAddedPayload {
  partId: string;
  system?: AnatomicalSystem;
  recordType: 'SYMPTOM' | 'CHECKUP' | 'INCIDENT' | 'TELEMETRY_ALERT' | 'AI_DIAGNOSIS' | 'TREATMENT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  treatment?: string;
  recordedBy: string;
}

export type ClinicalRecordAddedEvent = BaseDomainEvent<ClinicalRecordAddedPayload>;

export interface GeminiDiagnosisPayload {
  affectedParts: string[];
  diagnosis: string;
  gravityRiskFactor: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  countermeasures: string[];
  urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidenceScore: number;
}

export type GeminiDiagnosisGeneratedEvent = BaseDomainEvent<GeminiDiagnosisPayload>;
