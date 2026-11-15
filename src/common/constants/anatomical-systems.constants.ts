import { ALL_BODY_PART_IDS, BodyPartId, BODY_PARTS_METADATA } from './body-parts.constants';

export type AnatomicalSystem =
  | 'body'
  | 'skeleton'
  | 'cardiovascular'
  | 'nervous'
  | 'organs';

export const NOMINAL_COLOR = '#22C55E';  // Verde estado saludable
export const SELECTED_COLOR = '#38BDF8'; // Azul selección interactiva
export const WARNING_COLOR = '#F59E0B';  // Amarillo advertencia / síntoma
export const CRITICAL_COLOR = '#EF4444'; // Rojo crítico / emergencia

// 1. ESQUELETO (135 huesos de Esqueleto.glb)
export const ALL_SKELETON_PART_IDS = [
  'ClaviculaDer', 'ClaviculaIzq', 'CubitoDer', 'MDistal1_Der', 'MProximal1_Der',
  'Metacarpo1_Der', 'MDistal2_Der', 'MNudillo2_Der', 'MProximal2_Der', 'Metacarpo2_Der',
  'MDistal3_Der', 'MNudillo3_Der', 'MProximal3_Der', 'Metacarpo3_Der', 'MDistal4_Der',
  'MNudillo4_Der', 'MProximal4_Der', 'Metacarpo4_Der', 'MDistal5_Der', 'MNudillo5_Der',
  'MProximal5_Der', 'Metcarpo5_Der', 'CarpoDer', 'RadioDer', 'HumeroDer',
  'OmoplatoDer', 'CubitoIzq', 'MDistal1_Izq', 'MProximal1_Izq', 'Metacarpo1_Izq',
  'MDistal2_Izq', 'MNudillo2_Izq', 'MProximal2_Izq', 'Metacarpo2_Izq', 'MDistal3_Izq',
  'MNudillo3_Izq', 'MProximal3_Izq', 'Metacarpo3_Izq', 'MDistal4_Izq', 'MNudillo4_Izq',
  'MProximal4_Izq', 'Metacarpo4_Izq', 'MDistal5_Izq', 'MNudillo5_Izq', 'MProximal5_Izq',
  'Metcarpo5_Izq', 'CarpoIzq', 'RadioIzq', 'HumeroIzq', 'OmoplatoIzq',
  'Costillas', 'FibulaDer', 'PatelaDer', 'CalcaneoDer', 'Distal1_Der',
  'Proximal1_Der', 'Metatarso1_Der', 'Distal2_Der', 'PNudillo2_Der', 'Proximal2_Der',
  'Metatarso2_Der', 'Distal3_Der', 'PNudillo3_Der', 'Proximal3_Der', 'Metatarso3_Der',
  'Distal4_Der', 'PNudillo4_Der', 'Proximal4_Der', 'Metatarso4_Der', 'Distal5_Der',
  'PNudillo5_Der', 'Proximal5_Der', 'Metatarso5_Der', 'TarsoDer', 'TaloDer',
  'TibulaDer', 'FemurDer', 'FibulaIzq', 'PatelaIzq', 'CalcaneoIzq',
  'Distal1_Izq', 'Proximal1_Izq', 'Metatarso1_Izq', 'Distal2_Izq', 'PNudillo2_Izq',
  'Proximal2_Izq', 'Metatarso2_Izq', 'Distal3_Izq', 'PNudillo3_Izq', 'Proximal3_Izq',
  'Metatarso3_Izq', 'Distal4_Izq', 'PNudillo4_Izq', 'Proximal4_Izq', 'Metatarso4_Izq',
  'Distal5_Izq', 'PNudillo5_izq', 'Proximal5_Izq', 'Metatarso5_Izq', 'TarsoIzq',
  'TaloIzq', 'TibulaIzq', 'FemurIzq', 'Coxis', 'Craneo',
  'VertebraCervical1', 'VertebraCervical2', 'VertebraCervical3', 'VertebraCervical4',
  'VertebraCervical5', 'VertebraCervical6', 'VertebraCervical7', 'VertebraToracica',
  'VertebraToracica2', 'VertebraToracica3', 'VertebraToracica4', 'VertebraToracica5',
  'VertebraToracica6', 'VertebraToracica7', 'VertebraToracica8', 'VertebraToracica9',
  'VertebraToracica10', 'VertebraToracica11', 'VertebraToracica12', 'VertebraLumbar1',
  'VertebraLumbar1.5', 'VertebraLumbar2', 'VertebraLumbar2.5', 'VertebraLumbar3',
  'VertebraLumbar3.5', 'VertebraLumbar4', 'VertebraLumbar4.5', 'VertebraLumbar5',
  'Sacro', 'Cadera',
] as const;

export type SkeletonPartId = typeof ALL_SKELETON_PART_IDS[number];

// 2. SISTEMA CARDIOVASCULAR (33 vasos y corazón de SisCardiovascular.glb)
export const ALL_CARDIOVASCULAR_PART_IDS = [
  'ArteriaFemoralIzq', 'VenaCavaArteriaAorta', 'PulmonarDer1', 'PulmonarDer2',
  'PulmonarDer3', 'PulmonarDer4', 'PulmonarIzq1', 'PulmonarIzq3',
  'PulmonarIzq4', 'PulmonarIzq2', 'Subclava', 'VCerebral',
  'ACerebral', 'SubCarotida', 'Carotida', 'Corazon',
  'Brazo1', 'Brazo1.001', 'Brazo1.002', 'Brazo1.003',
  'Brazo1.004', 'Brazo1.005', 'Brazo1.006', 'Brazo1.007',
  'Brazo1.008', 'Brazo1.009', 'NurbsPath', 'NurbsPath.001',
  'NurbsPath.002', 'NurbsPath.003', 'NurbsPath.004', 'NurbsPath.005',
  'NurbsPath.006',
] as const;

export type CardiovascularPartId = typeof ALL_CARDIOVASCULAR_PART_IDS[number];

// 3. SISTEMA NERVIOSO CENTRAL (5 estructuras de SisNervioso.glb)
export const ALL_NERVOUS_PART_IDS = [
  'CerebroDer',
  'CerebroIzq',
  'Cerebelo',
  'Diencefalo',
  'MedulaEspinal',
] as const;

export type NervousPartId = typeof ALL_NERVOUS_PART_IDS[number];

// 4. ÓRGANOS INTERNOS (4 órganos de Organos.glb)
export const ALL_ORGAN_PART_IDS = [
  'Pulmones',
  'Digestivo',
  'Higado',
  'Rinones',
] as const;

export type OrganPartId = typeof ALL_ORGAN_PART_IDS[number];

export interface SystemMetadataItem {
  id: string;
  label: string;
  region: string;
  description?: string;
}

export const SYSTEM_PARTS_CATALOG: Record<AnatomicalSystem, {
  name: string;
  partIds: readonly string[];
  defaultColor: string;
}> = {
  body: {
    name: 'Cuerpo Holográfico',
    partIds: ALL_BODY_PART_IDS,
    defaultColor: NOMINAL_COLOR,
  },
  skeleton: {
    name: 'Sistema Esquelético',
    partIds: ALL_SKELETON_PART_IDS,
    defaultColor: '#EFECE6', // Color hueso natural
  },
  cardiovascular: {
    name: 'Sistema Cardiovascular',
    partIds: ALL_CARDIOVASCULAR_PART_IDS,
    defaultColor: '#C62828', // Carmesí vascular
  },
  nervous: {
    name: 'Sistema Nervioso Central',
    partIds: ALL_NERVOUS_PART_IDS,
    defaultColor: '#9C27B0', // Violeta neural
  },
  organs: {
    name: 'Órganos Internos',
    partIds: ALL_ORGAN_PART_IDS,
    defaultColor: '#E65100', // Terracota visceral
  },
};
