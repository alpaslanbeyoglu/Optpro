export type EyeType = 'OD' | 'OS';

export type FrameType = 'acetate' | 'metal' | 'semi_rimless' | 'rimless';

export type FrameShape = 'round' | 'rectangular' | 'oval' | 'cateye' | 'aviator';

export type BevelPosition = 'one_third' | 'centered' | 'front_flush';

export type SurfaceTechnology = 'spheric' | 'aspheric' | 'biaspheric' | 'zeiss_clearview';

export interface SurfaceTechInfo {
  id: SurfaceTechnology;
  name: string;
  shortName: string;
  badge: string;
  description: string;
  thicknessFactor: number; // e.g. 1.0 (sferik), 0.90 (asiferik %10 ek incelme), 0.85 (bi-asiferik %15 ek incelme), 0.84 (zeiss clearview %16 ek incelme)
  flatnessBonusPercent: number; // % bombelik azalması (0%, 25%, 40%, 49% daha düz)
  clearVisionFieldMultiplier: number; // 1.0x, 1.6x, 2.2x, 3.0x net görüş alanı
  aberrationReduction: string;
  idealFor: string;
}

export interface EyePrescription {
  sph: number; // Sferik (-15.00 ile +10.00)
  cyl: number; // Silindirik (-6.00 ile 0.00 / +4.00)
  axis: number; // Aks (1 - 180)
  pdMono: number; // Monoküler PD (gözbebeği mesafesi: örn. 31mm)
  height: number; // Montaj yüksekliği (çerçevenin alt kenarından pupile: örn. 20mm)
}

export interface PrescriptionState {
  od: EyePrescription; // Sağ Göz
  os: EyePrescription; // Sol Göz
  activeEye: EyeType;
  patientName: string;
  notes: string;
}

export interface FrameParameters {
  a: number; // Ekartman / Lens Genişliği (mm) örn. 52
  b: number; // Lens Yüksekliği (mm) örn. 40
  dbl: number; // Köprü Mesafesi (mm) örn. 18
  frameType: FrameType; // Kemik, Metal, Nilör, Faset
  shape: FrameShape;
  bevelPosition: BevelPosition;
}

export interface LensMaterial {
  id: string;
  index: number;
  name: string;
  shortName: string;
  reductionLabel: string;
  abbeValue: number;
  density: number; // g/cm³
  uvProtection: string;
  impactResistance: string; // "Orta", "Yüksek", "Çok Yüksek"
  baseCenterThicknessMinus: number;
  baseEdgeThicknessPlus: number;
  description: string;
  recommendedRange: string;
  accentColor: string;
}

export interface PerimeterPoint {
  angleDeg: number;
  radiusMm: number;
  effectivePower: number;
  thicknessMm: number;
  xMm: number;
  yMm: number;
}

export interface LensCalculationResult {
  material: LensMaterial;
  surfaceTech: SurfaceTechnology;
  flatnessBonusPercent: number;
  clearVisionFieldMultiplier: number;
  centerThickness: number;
  maxEdgeThickness: number;
  minEdgeThickness: number;
  nasalEdgeThickness: number;
  temporalEdgeThickness: number;
  superiorEdgeThickness: number;
  inferiorEdgeThickness: number;
  weightGrams: number;
  thicknessReductionPercent: number; // % incelme (1.50'ye kıyasla)
  weightReductionPercent: number; // % hafifleme (1.50'ye kıyasla)
  frameRimThickness: number; // Çerçevenin et kalınlığı (örn. 4.0mm)
  overhangFront: number; // Öne taşma (mm)
  overhangRear: number; // Arkaya taşma (mm)
  totalOverhang: number; // Toplam taşma (mm)
  suitabilityScore: 'optimal' | 'recommended' | 'acceptable' | 'too_thick' | 'unsuitable';
  recommendationReason: string;
  perimeterPoints: PerimeterPoint[];
}

export interface PrescriptionPreset {
  id: string;
  label: string;
  description: string;
  tag: string;
  sph: number;
  cyl: number;
  axis: number;
}
