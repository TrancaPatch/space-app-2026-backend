/**
 * Catálogo maestro de las 49 partes anatómicas del cuerpo humano.
 * Estos identificadores coinciden exactamente 1:1 con las mallas/materiales
 * de CuerpoSeparado-1.glb y con la configuración del frontend en bodyPartsConfig.ts.
 */

export const ALL_BODY_PART_IDS = [
  // Cabeza y Cuello (12)
  'Cabeza',
  'Cuello',
  'Nariz',
  'Tabique',
  'OjoDer',
  'OjoIzq',
  'ParpadoSuperiorDer',
  'ParpadoSuperiorIzq',
  'ParpadoInferiorDer',
  'ParpadoInferiorIzq',
  'OrejaDer',
  'OrejaIzq',
  // Tronco (3)
  'Pecho',
  'Torso',
  'Pelvis',
  // Extremidad Superior Derecha (9)
  'HombroDer',
  'BrazoDer',
  'AntebrazoDer',
  'PalmaDer',
  'DM1_Der',
  'DM2_Der',
  'DM3_Der',
  'DM4_Der',
  'DM5_Der',
  // Extremidad Superior Izquierda (9)
  'HombroIzq',
  'BrazoIzq',
  'AntebrazoIzq',
  'PalmaIzq',
  'DM1_Izq',
  'DM2_Izq',
  'DM3_Izq',
  'DM4_Izq',
  'DM5_Izq',
  // Extremidad Inferior Derecha (8)
  'MusloDer',
  'PantorrillaDer',
  'PieDer',
  'DP1_Der',
  'DP2_Der',
  'DP3_Der',
  'DP4_Der',
  'DP5_Der',
  // Extremidad Inferior Izquierda (8)
  'MusloIzq',
  'PantorrillaIzq',
  'PieIzq',
  'DP1_Izq',
  'DP2_Izq',
  'DP3_Izq',
  'DP4_Izq',
  'DP5_Izq',
] as const;

export type BodyPartId = typeof ALL_BODY_PART_IDS[number];

export type BodyRegion =
  | 'Cabeza y Cuello'
  | 'Tronco'
  | 'Brazo Derecho'
  | 'Brazo Izquierdo'
  | 'Pierna Derecha'
  | 'Pierna Izquierda';

export interface BodyPartMetadata {
  id: BodyPartId;
  label: string;
  region: BodyRegion;
  criticalSensors?: string[];
}

export const NOMINAL_COLOR = '#22C55E';  // Verde estado nominal
export const WARNING_COLOR = '#F59E0B';  // Ámbar estado advertencia
export const CRITICAL_COLOR = '#EF4444'; // Rojo estado crítico
export const SELECTED_COLOR = '#38BDF8'; // Azul cian selección

export const BODY_PARTS_METADATA: Record<BodyPartId, BodyPartMetadata> = {
  // 1. Cabeza y Cuello (12)
  Cabeza: { id: 'Cabeza', label: 'Cabeza (Cráneo)', region: 'Cabeza y Cuello', criticalSensors: ['EEG', 'ICP_Estimator', 'RadiationDosimeter_Head'] },
  Cuello: { id: 'Cuello', label: 'Cuello', region: 'Cabeza y Cuello', criticalSensors: ['CarotidPulse', 'CervicalStrain'] },
  Nariz: { id: 'Nariz', label: 'Nariz', region: 'Cabeza y Cuello' },
  Tabique: { id: 'Tabique', label: 'Tabique Nasal', region: 'Cabeza y Cuello' },
  OjoDer: { id: 'OjoDer', label: 'Ojo Derecho', region: 'Cabeza y Cuello', criticalSensors: ['IOP_Sensor_Right', 'Pupillometer'] },
  OjoIzq: { id: 'OjoIzq', label: 'Ojo Izquierdo', region: 'Cabeza y Cuello', criticalSensors: ['IOP_Sensor_Left', 'Pupillometer'] },
  ParpadoSuperiorDer: { id: 'ParpadoSuperiorDer', label: 'Párpado Superior Derecho', region: 'Cabeza y Cuello' },
  ParpadoSuperiorIzq: { id: 'ParpadoSuperiorIzq', label: 'Párpado Superior Izquierdo', region: 'Cabeza y Cuello' },
  ParpadoInferiorDer: { id: 'ParpadoInferiorDer', label: 'Párpado Inferior Derecho', region: 'Cabeza y Cuello' },
  ParpadoInferiorIzq: { id: 'ParpadoInferiorIzq', label: 'Párpado Inferior Izquierdo', region: 'Cabeza y Cuello' },
  OrejaDer: { id: 'OrejaDer', label: 'Oreja Derecha', region: 'Cabeza y Cuello', criticalSensors: ['VestibularMonitor_Right'] },
  OrejaIzq: { id: 'OrejaIzq', label: 'Oreja Izquierda', region: 'Cabeza y Cuello', criticalSensors: ['VestibularMonitor_Left'] },

  // 2. Tronco (3)
  Pecho: { id: 'Pecho', label: 'Pecho (Tórax)', region: 'Tronco', criticalSensors: ['ECG_Lead_II', 'BioSuit_Respiration', 'SpO2_Chest'] },
  Torso: { id: 'Torso', label: 'Torso / Abdomen', region: 'Tronco', criticalSensors: ['CoreTemperature', 'AbdominalPressure'] },
  Pelvis: { id: 'Pelvis', label: 'Pelvis', region: 'Tronco', criticalSensors: ['PelvicStrain'] },

  // 3. Extremidad Superior Derecha (9)
  HombroDer: { id: 'HombroDer', label: 'Hombro Derecho', region: 'Brazo Derecho', criticalSensors: ['JointTorque_R_Shoulder'] },
  BrazoDer: { id: 'BrazoDer', label: 'Brazo Derecho (Bíceps)', region: 'Brazo Derecho', criticalSensors: ['EMG_Right_Bicep', 'BrachialBloodPressure'] },
  AntebrazoDer: { id: 'AntebrazoDer', label: 'Antebrazo Derecho', region: 'Brazo Derecho', criticalSensors: ['EMG_Right_Forearm'] },
  PalmaDer: { id: 'PalmaDer', label: 'Palma Derecha', region: 'Brazo Derecho', criticalSensors: ['GripForce_Right', 'GSR_Right'] },
  DM1_Der: { id: 'DM1_Der', label: 'Dedo Pulgar Derecho', region: 'Brazo Derecho' },
  DM2_Der: { id: 'DM2_Der', label: 'Dedo Índice Derecho', region: 'Brazo Derecho', criticalSensors: ['SpO2_Peripheral_Right'] },
  DM3_Der: { id: 'DM3_Der', label: 'Dedo Medio Derecho', region: 'Brazo Derecho' },
  DM4_Der: { id: 'DM4_Der', label: 'Dedo Anular Derecho', region: 'Brazo Derecho' },
  DM5_Der: { id: 'DM5_Der', label: 'Dedo Meñique Derecho', region: 'Brazo Derecho' },

  // 4. Extremidad Superior Izquierda (9)
  HombroIzq: { id: 'HombroIzq', label: 'Hombro Izquierdo', region: 'Brazo Izquierdo', criticalSensors: ['JointTorque_L_Shoulder'] },
  BrazoIzq: { id: 'BrazoIzq', label: 'Brazo Izquierdo (Bíceps)', region: 'Brazo Izquierdo', criticalSensors: ['EMG_Left_Bicep'] },
  AntebrazoIzq: { id: 'AntebrazoIzq', label: 'Antebrazo Izquierdo', region: 'Brazo Izquierdo', criticalSensors: ['EMG_Left_Forearm'] },
  PalmaIzq: { id: 'PalmaIzq', label: 'Palma Izquierda', region: 'Brazo Izquierdo', criticalSensors: ['GripForce_Left', 'GSR_Left'] },
  DM1_Izq: { id: 'DM1_Izq', label: 'Dedo Pulgar Izquierdo', region: 'Brazo Izquierdo' },
  DM2_Izq: { id: 'DM2_Izq', label: 'Dedo Índice Izquierdo', region: 'Brazo Izquierdo', criticalSensors: ['SpO2_Peripheral_Left'] },
  DM3_Izq: { id: 'DM3_Izq', label: 'Dedo Medio Izquierdo', region: 'Brazo Izquierdo' },
  DM4_Izq: { id: 'DM4_Izq', label: 'Dedo Anular Izquierdo', region: 'Brazo Izquierdo' },
  DM5_Izq: { id: 'DM5_Izq', label: 'Dedo Meñique Izquierdo', region: 'Brazo Izquierdo' },

  // 5. Extremidad Inferior Derecha (8)
  MusloDer: { id: 'MusloDer', label: 'Muslo Derecho (Cuádriceps)', region: 'Pierna Derecha', criticalSensors: ['EMG_Right_Quadriceps', 'FemoralPerfusion'] },
  PantorrillaDer: { id: 'PantorrillaDer', label: 'Pantorrilla Derecha', region: 'Pierna Derecha', criticalSensors: ['TibialStrain_Right'] },
  PieDer: { id: 'PieDer', label: 'Pie Derecho', region: 'Pierna Derecha', criticalSensors: ['PlantarPressure_Right'] },
  DP1_Der: { id: 'DP1_Der', label: 'Dedo Gordo Pie Derecho', region: 'Pierna Derecha' },
  DP2_Der: { id: 'DP2_Der', label: 'Segundo Dedo Pie Derecho', region: 'Pierna Derecha' },
  DP3_Der: { id: 'DP3_Der', label: 'Tercer Dedo Pie Derecho', region: 'Pierna Derecha' },
  DP4_Der: { id: 'DP4_Der', label: 'Cuarto Dedo Pie Derecho', region: 'Pierna Derecha' },
  DP5_Der: { id: 'DP5_Der', label: 'Quinto Dedo Pie Derecho', region: 'Pierna Derecha' },

  // 6. Extremidad Inferior Izquierda (8)
  MusloIzq: { id: 'MusloIzq', label: 'Muslo Izquierdo (Cuádriceps)', region: 'Pierna Izquierda', criticalSensors: ['EMG_Left_Quadriceps', 'FemoralPerfusion'] },
  PantorrillaIzq: { id: 'PantorrillaIzq', label: 'Pantorrilla Izquierda', region: 'Pierna Izquierda', criticalSensors: ['TibialStrain_Left'] },
  PieIzq: { id: 'PieIzq', label: 'Pie Izquierdo', region: 'Pierna Izquierda', criticalSensors: ['PlantarPressure_Left'] },
  DP1_Izq: { id: 'DP1_Izq', label: 'Dedo Gordo Pie Izquierdo', region: 'Pierna Izquierda' },
  DP2_Izq: { id: 'DP2_Izq', label: 'Segundo Dedo Pie Izquierdo', region: 'Pierna Izquierda' },
  DP3_Izq: { id: 'DP3_Izq', label: 'Tercer Dedo Pie Izquierdo', region: 'Pierna Izquierda' },
  DP4_Izq: { id: 'DP4_Izq', label: 'Cuarto Dedo Pie Izquierdo', region: 'Pierna Izquierda' },
  DP5_Izq: { id: 'DP5_Izq', label: 'Quinto Dedo Pie Izquierdo', region: 'Pierna Izquierda' },
};
