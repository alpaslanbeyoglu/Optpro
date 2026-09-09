import {
  EyePrescription,
  FrameParameters,
  LensCalculationResult,
  LensMaterial,
  PerimeterPoint,
  PrescriptionPreset,
  SurfaceTechInfo,
  SurfaceTechnology,
} from '../types';

export const SURFACE_TECHNOLOGIES: SurfaceTechInfo[] = [
  {
    id: 'spheric',
    name: 'Sferik (Geleneksel Küresel)',
    shortName: 'Sferik Standart',
    badge: 'Standart Kavis',
    description: 'Klasik küresel ön ve arka yüzey. Merkezde net odaklama sağlar; ancak kenarlara doğru distorsiyon, şişe dibi halkaları ve göz küçültme/büyütme etkisi oluşur.',
    thicknessFactor: 1.0,
    flatnessBonusPercent: 0,
    clearVisionFieldMultiplier: 1.0,
    aberrationReduction: 'Temel Düzey',
    idealFor: '±1.50 D altı düşük numaralar',
  },
  {
    id: 'aspheric',
    name: 'Asiferik (AS - Tek Yüzey Asferik)',
    shortName: 'Asiferik (AS)',
    badge: '%10 Ek İnce / %25 Daha Düz',
    description: 'Ön yüzeyi eliptik/parabolik olarak düzleştirilmiş tasarım. Cam kavisini düzleştirir, kenar kalınlığını %10 azaltır ve miyop camlardaki göz küçültme etkisini belirgin şekilde engeller.',
    thicknessFactor: 0.90,
    flatnessBonusPercent: 25,
    clearVisionFieldMultiplier: 1.6,
    aberrationReduction: '%25 Düz kavis, doğal göz boyutu',
    idealFor: 'Orta ve yüksek miyop / hipermetrop kullanıcılar',
  },
  {
    id: 'biaspheric',
    name: 'Bi-Asiferik (Çift Yüzey / Double Aspheric)',
    shortName: 'Bi-Asiferik (Bi-AS)',
    badge: '%15 Ek İnce / %40 Daha Düz',
    description: 'Hem ön hem arka yüzeyi 360 derece çift asiferik optimize edilmiş üst segment tasarım (Örn. Hoya Nulux EP, Seiko A-Zone). Özellikle astigmatlı reçetelerde iki eksende de kenar distorsiyonunu sıfırlar, panoramik geniş görüş sunar.',
    thicknessFactor: 0.85,
    flatnessBonusPercent: 40,
    clearVisionFieldMultiplier: 2.2,
    aberrationReduction: 'Astigmatta panoramik netlik, kenar distorsiyonsuz',
    idealFor: 'Astigmatlı hastalar ve yüksek estetik arayanlar',
  },
  {
    id: 'zeiss_clearview',
    name: 'ZEISS ClearView (FreeForm Tek Odaklı)',
    shortName: 'ZEISS ClearView',
    badge: '3 Kat Geniş Görüş / %16 Ek İnce / %49 Daha Düz',
    description: 'Alman ZEISS teknolojisinin tek odaklı camlarda serbest form (FreeForm) devrimi. Yüzeydeki 700 bağımsız referans nokta ile optimize edilmiştir. Standart sferik camlara kıyasla merkezden kenara kadar 3 kat daha geniş berrak görüş alanı, %16\'ya varan ekstra incelme ve %49\'a kadar daha düz estetik profil sunar.',
    thicknessFactor: 0.84,
    flatnessBonusPercent: 49,
    clearVisionFieldMultiplier: 3.0,
    aberrationReduction: '3x Geniş Net Alan, %49 Düz Profil, FreeForm Kristal Netlik',
    idealFor: 'Maksimum optik netlik, en düz cam profili ve birinci sınıf estetik',
  },
];

export const LENS_MATERIALS: LensMaterial[] = [
  {
    id: '1.50',
    index: 1.498,
    name: '1.50 Standart Organik (CR-39)',
    shortName: '1.50 Standart',
    reductionLabel: 'Standart Kalınlık',
    abbeValue: 58,
    density: 1.32,
    uvProtection: 'UV380 (%90)',
    impactResistance: 'Standart',
    baseCenterThicknessMinus: 1.8,
    baseEdgeThicknessPlus: 1.0,
    description: 'En ekonomik ve yüksek optik netliğe (Abbe 58) sahip standart cam. Düşük numaralar için uygundur.',
    recommendedRange: '0.00 ile ±2.00 D arası',
    accentColor: '#64748b', // slate
  },
  {
    id: '1.56',
    index: 1.56,
    name: '1.56 Orta İndeks (Mid-Index)',
    shortName: '1.56 İnceltilmiş',
    reductionLabel: '%15-20 İnceltilmiş',
    abbeValue: 38,
    density: 1.28,
    uvProtection: 'UV400 (%100)',
    impactResistance: 'Orta',
    baseCenterThicknessMinus: 1.5,
    baseEdgeThicknessPlus: 1.0,
    description: 'Standart cama göre %15-20 daha ince ve hafiftir. Hafif-orta numaralarda iyi bir fiyat/performans seçeneğidir.',
    recommendedRange: '±2.00 ile ±3.50 D arası',
    accentColor: '#0284c7', // sky
  },
  {
    id: '1.61',
    index: 1.605,
    name: '1.61 Yüksek İndeks (Hi-Index MR-8)',
    shortName: '1.61 %30 İnce',
    reductionLabel: '%30-35 İnceltilmiş',
    abbeValue: 41,
    density: 1.30,
    uvProtection: 'UV400 (%100)',
    impactResistance: 'Yüksek (Esnek)',
    baseCenterThicknessMinus: 1.3,
    baseEdgeThicknessPlus: 1.0,
    description: 'Yüksek kırılma direnci ve MR-8 reçine yapısı ile Nilör (misinalı) ve Faset (vidalı) çerçeveler için en güvenli ve dengeli camdır.',
    recommendedRange: '±3.00 ile ±5.00 D arası',
    accentColor: '#2563eb', // blue
  },
  {
    id: '1.67',
    index: 1.668,
    name: '1.67 Süper Yüksek İndeks',
    shortName: '1.67 %45 İnce',
    reductionLabel: '%40-45 İnceltilmiş',
    abbeValue: 32,
    density: 1.35,
    uvProtection: 'UV400 (%100)',
    impactResistance: 'Yüksek',
    baseCenterThicknessMinus: 1.15,
    baseEdgeThicknessPlus: 1.0,
    description: 'Yüksek numaralarda cam kenar kalınlığını ciddi oranda düşürür. Asferik tasarımıyla gözlerin küçük/büyük görünmesini engeller.',
    recommendedRange: '±4.50 ile ±7.50 D arası',
    accentColor: '#7c3aed', // violet
  },
  {
    id: '1.74',
    index: 1.74,
    name: '1.74 Ultra Yüksek İndeks',
    shortName: '1.74 %55 Ultra İnce',
    reductionLabel: '%50-55 Ultra İnce',
    abbeValue: 33,
    density: 1.47,
    uvProtection: 'UV400 (%100)',
    impactResistance: 'Orta',
    baseCenterThicknessMinus: 1.05,
    baseEdgeThicknessPlus: 1.0,
    description: 'Organik camlarda üretilebilen en ince ve estetik seviyedir. Çok yüksek numaralarda maksimum incelik ve hafiflik sağlar.',
    recommendedRange: '±6.00 D ve üzeri',
    accentColor: '#059669', // emerald
  },
  {
    id: '1.59',
    index: 1.586,
    name: '1.59 Polikarbonat (Airwear)',
    shortName: '1.59 Kırılmaz',
    reductionLabel: '%20-25 İnce / Kırılmaz',
    abbeValue: 30,
    density: 1.20,
    uvProtection: 'UV400 (%100)',
    impactResistance: 'En Yüksek (Darbeye Dayanıklı)',
    baseCenterThicknessMinus: 1.35,
    baseEdgeThicknessPlus: 1.1,
    description: 'Kırılmaya karşı standart camdan 10 kat daha dayanıklıdır. Çocuklar, sporcular ve güvenlik gözlükleri için idealdir.',
    recommendedRange: 'Çocuk & Spor & Faset',
    accentColor: '#ea580c', // orange
  },
  {
    id: '1.53',
    index: 1.53,
    name: '1.53 Trivex (Ultra Hafif)',
    shortName: '1.53 Trivex',
    reductionLabel: 'Ultra Hafif / Kırılmaz',
    abbeValue: 45,
    density: 1.11,
    uvProtection: 'UV400 (%100)',
    impactResistance: 'En Yüksek (Çatlamaz)',
    baseCenterThicknessMinus: 1.4,
    baseEdgeThicknessPlus: 1.2,
    description: '1.11 g/cm³ ile dünyanın en hafif gözlük camı malzemesidir. Yüksek Abbe değeri (45) ve mükemmel darbe direnci sunar.',
    recommendedRange: 'Hafiflik & Faset Montaj',
    accentColor: '#0d9488', // teal
  },
];

export const PRESCRIPTION_PRESETS: PrescriptionPreset[] = [
  {
    id: 'mild-myopia',
    label: 'Hafif Miyop',
    description: '-1.50 SPH',
    tag: 'Düşük Numara',
    sph: -1.50,
    cyl: 0.00,
    axis: 180,
  },
  {
    id: 'moderate-astigmatism',
    label: 'Miyop & Astigmat',
    description: '-3.25 SPH / -1.50 CYL 90°',
    tag: 'Orta Numara',
    sph: -3.25,
    cyl: -1.50,
    axis: 90,
  },
  {
    id: 'high-myopia',
    label: 'Yüksek Miyop',
    description: '-6.00 SPH / -1.00 CYL 180°',
    tag: 'Yüksek Numara',
    sph: -6.00,
    cyl: -1.00,
    axis: 180,
  },
  {
    id: 'extreme-myopia',
    label: 'Çok Yüksek Miyop',
    description: '-8.50 SPH / -1.75 CYL 15°',
    tag: 'Kritik İnceltme',
    sph: -8.50,
    cyl: -1.75,
    axis: 15,
  },
  {
    id: 'hyperopia',
    label: 'Hipermetrop',
    description: '+4.00 SPH / -0.75 CYL 90°',
    tag: 'Merkez Kalınlığı',
    sph: 4.00,
    cyl: -0.75,
    axis: 90,
  },
  {
    id: 'mixed-astigmatism',
    label: 'Miks Astigmat',
    description: '+2.00 SPH / -3.00 CYL 45°',
    tag: 'Aks Farkı',
    sph: 2.00,
    cyl: -3.00,
    axis: 45,
  },
];

export function getFrameRimThickness(frameType: FrameParameters['frameType']): number {
  switch (frameType) {
    case 'acetate':
      return 4.2; // Kemik / Asetat çerçeve et payı
    case 'metal':
      return 2.1; // İnce metal profil
    case 'semi_rimless':
      return 1.8; // Nilör üst metal / alt misina
    case 'rimless':
      return 0.0; // Faset / Çerçevesiz (kenar tamamen açıkta)
  }
}

/**
 * Calculates the contour radius of the frame shape at a given angle theta (in radians).
 */
export function getFrameRadiusAtAngle(
  thetaRad: number,
  aWidth: number,
  bHeight: number,
  shape: FrameParameters['shape']
): { x: number; y: number; r: number } {
  const halfA = aWidth / 2;
  const halfB = bHeight / 2;

  let x = halfA * Math.cos(thetaRad);
  let y = halfB * Math.sin(thetaRad);

  if (shape === 'round') {
    const avgR = (halfA + halfB) / 2;
    x = avgR * Math.cos(thetaRad);
    y = avgR * Math.sin(thetaRad);
  } else if (shape === 'rectangular') {
    // Superellipse / squircle effect: |x/a|^n + |y/b|^n = 1 (n=3.2)
    const n = 3.2;
    const cosT = Math.cos(thetaRad);
    const sinT = Math.sin(thetaRad);
    const denom = Math.pow(Math.abs(cosT), n) + Math.pow(Math.abs(sinT), n);
    const factor = Math.pow(denom, -1 / n);
    x = halfA * cosT * factor;
    y = halfB * sinT * factor;
  } else if (shape === 'cateye') {
    // Flare outer upper corner
    const cosT = Math.cos(thetaRad);
    const sinT = Math.sin(thetaRad);
    const flare = (cosT > 0 && sinT > 0) ? 1.15 : 1.0;
    x = halfA * cosT * flare;
    y = halfB * sinT * flare;
  } else if (shape === 'aviator') {
    // Teardrop lower expansion
    const cosT = Math.cos(thetaRad);
    const sinT = Math.sin(thetaRad);
    const drop = (sinT < 0) ? 1.12 : 0.95;
    x = halfA * cosT;
    y = halfB * sinT * drop;
  }

  const r = Math.sqrt(x * x + y * y);
  return { x, y, r };
}

/**
 * Calculates effective power along a meridian angle using Euler's formula:
 * F(theta) = SPH + CYL * sin^2(theta - axis)
 */
export function getMeridianPower(sph: number, cyl: number, axisDeg: number, angleDeg: number): number {
  const diffRad = ((angleDeg - axisDeg) * Math.PI) / 180;
  return sph + cyl * Math.pow(Math.sin(diffRad), 2);
}

/**
 * Calculates thickness profile and mechanical characteristics of a lens
 */
export function calculateLensMetrics(
  prescription: EyePrescription,
  frame: FrameParameters,
  material: LensMaterial,
  baselineResult?: LensCalculationResult,
  surfaceTech: SurfaceTechnology = 'spheric'
): LensCalculationResult {
  const { sph, cyl, axis, pdMono, height } = prescription;
  const { a, b, dbl, frameType, shape, bevelPosition } = frame;

  const tech = SURFACE_TECHNOLOGIES.find((t) => t.id === surfaceTech) || SURFACE_TECHNOLOGIES[0];

  // Geometric center of frame vs optical center
  // Frame PD = a + dbl
  const framePD = a + dbl;
  // Nasal decentration (towards bridge)
  // For Right Eye (OD): optical center is shifted nasal (towards -x)
  const decentrationX = (framePD / 2) - pdMono;
  // Vertical decentration: optical center relative to horizontal midline (b / 2)
  const decentrationY = height - (b / 2);

  // Optical Center coordinate relative to lens geometric center:
  // We represent x > 0 as Temporal (şakak), x < 0 as Nasal (burun)
  // Optical center is shifted by nasal decentration towards nasal side:
  const ocX = -decentrationX;
  const ocY = decentrationY;

  // We sample 72 points around the perimeter (every 5 degrees)
  const sampleSteps = 72;
  const perimeterPoints: PerimeterPoint[] = [];

  // Determine if it's primarily a minus or plus lens
  // Look at extreme meridian powers
  const power1 = sph;
  const power2 = sph + cyl;
  const isOverallMinus = (power1 <= 0 && power2 <= 0) || (Math.abs(Math.min(power1, power2)) >= Math.abs(Math.max(power1, power2)));

  // Minimum center thickness for minus lens, or minimum edge thickness for plus lens
  let baseCenterThickness = material.baseCenterThicknessMinus;
  let baseEdgeThickness = material.baseEdgeThicknessPlus;

  // Nilör / Faset frames need thicker safety margins to allow groove/drilling without chipping
  if (frameType === 'semi_rimless') {
    baseCenterThickness = Math.max(baseCenterThickness, 1.4);
    baseEdgeThickness = Math.max(baseEdgeThickness, 2.0); // nilör kanalı için en az 2.0mm kenar
  } else if (frameType === 'rimless') {
    baseCenterThickness = Math.max(baseCenterThickness, 1.5);
    baseEdgeThickness = Math.max(baseEdgeThickness, 2.2); // vida deliği çatlamaması için en az 2.2mm
  }

  // First pass: calculate radial distances from OC to perimeter and local sagitta differences
  let maxSagDelta = 0;
  let minSagDelta = Infinity;

  const rawPoints: Array<{
    angleDeg: number;
    effectivePower: number;
    distanceFromOC: number;
    sagDelta: number;
    x: number;
    y: number;
  }> = [];

  for (let i = 0; i < sampleSteps; i++) {
    const angleDeg = (i * 360) / sampleSteps;
    const angleRad = (angleDeg * Math.PI) / 180;

    // Point on frame rim
    const rimPoint = getFrameRadiusAtAngle(angleRad, a, b, shape);

    // Distance from optical center (ocX, ocY) to this rim point
    const dx = rimPoint.x - ocX;
    const dy = rimPoint.y - ocY;
    const distanceFromOC = Math.sqrt(dx * dx + dy * dy);

    // Effective power along this radial direction
    // Note: the meridian direction corresponds to the angle from OC to the point
    const directionDeg = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
    const effectivePower = getMeridianPower(sph, cyl, axis, directionDeg);

    // Exact Sagitta formula:
    // delta_t = (y^2 * |F|) / (2000 * (n - 1))
    // Refined with higher order sagitta for high powers:
    // R = 1000 * (n - 1) / F; sag = R - sqrt(R^2 - y^2)
    const n = material.index;
    let sagDelta = 0;
    const absP = Math.abs(effectivePower);
    if (absP > 0.01) {
      const R = (1000 * (n - 1)) / absP;
      if (R > distanceFromOC) {
        sagDelta = R - Math.sqrt(R * R - distanceFromOC * distanceFromOC);
      } else {
        sagDelta = (distanceFromOC * distanceFromOC * absP) / (2000 * (n - 1));
      }
    }

    // Apply surface technology thickness factor (Aspheric, Bi-Aspheric, Zeiss ClearView)
    sagDelta = sagDelta * tech.thicknessFactor;

    if (sagDelta > maxSagDelta) maxSagDelta = sagDelta;
    if (sagDelta < minSagDelta) minSagDelta = sagDelta;

    rawPoints.push({
      angleDeg,
      effectivePower,
      distanceFromOC,
      sagDelta,
      x: rimPoint.x,
      y: rimPoint.y,
    });
  }

  // Calculate actual center thickness and edge thicknesses:
  let centerThickness = 0;

  if (isOverallMinus) {
    // For minus lens: center is thinnest (baseCenterThickness)
    centerThickness = baseCenterThickness;
  } else {
    // For plus lens: edge at thinnest point must be at least baseEdgeThickness
    // centerThickness = baseEdgeThickness + maxSagDelta
    centerThickness = Math.max(1.8, baseEdgeThickness + maxSagDelta);
  }

  let maxEdgeThickness = 0;
  let minEdgeThickness = Infinity;

  // Cardinal edge points (0° = Temporal, 90° = Superior, 180° = Nasal, 270° = Inferior)
  let temporalEdgeThickness = 0;
  let nasalEdgeThickness = 0;
  let superiorEdgeThickness = 0;
  let inferiorEdgeThickness = 0;

  for (const pt of rawPoints) {
    let edgeThick = 0;
    if (pt.effectivePower <= 0) {
      // Minus power at this meridian: edge is thicker than center
      edgeThick = centerThickness + pt.sagDelta;
    } else {
      // Plus power at this meridian: edge is thinner than center
      edgeThick = Math.max(baseEdgeThickness, centerThickness - pt.sagDelta);
    }

    if (edgeThick > maxEdgeThickness) maxEdgeThickness = edgeThick;
    if (edgeThick < minEdgeThickness) minEdgeThickness = edgeThick;

    // Approximate cardinal angles
    if (Math.abs(pt.angleDeg - 0) < 3 || Math.abs(pt.angleDeg - 360) < 3) temporalEdgeThickness = edgeThick;
    if (Math.abs(pt.angleDeg - 180) < 3) nasalEdgeThickness = edgeThick;
    if (Math.abs(pt.angleDeg - 90) < 3) superiorEdgeThickness = edgeThick;
    if (Math.abs(pt.angleDeg - 270) < 3) inferiorEdgeThickness = edgeThick;

    perimeterPoints.push({
      angleDeg: pt.angleDeg,
      radiusMm: pt.distanceFromOC,
      effectivePower: pt.effectivePower,
      thicknessMm: Number(edgeThick.toFixed(2)),
      xMm: Number(pt.x.toFixed(2)),
      yMm: Number(pt.y.toFixed(2)),
    });
  }

  // Weight estimation in grams
  // Lens volume ~ Area * average thickness
  const lensAreaMm2 = Math.PI * (a / 2) * (b / 2); // mm²
  const avgThicknessMm = (centerThickness + (maxEdgeThickness + minEdgeThickness) / 2) / 2;
  const volumeCm3 = (lensAreaMm2 * avgThicknessMm) / 1000;
  const weightGrams = Number((volumeCm3 * material.density).toFixed(1));

  // Frame overhang calculation
  const frameRimThickness = getFrameRimThickness(frameType);
  let overhangFront = 0;
  let overhangRear = 0;
  let totalOverhang = 0;

  if (maxEdgeThickness > frameRimThickness && frameRimThickness > 0) {
    const extra = maxEdgeThickness - frameRimThickness;
    if (bevelPosition === 'one_third') {
      // 1/3 in front, 2/3 in rear
      overhangFront = Number((extra * 0.3).toFixed(2));
      overhangRear = Number((extra * 0.7).toFixed(2));
    } else if (bevelPosition === 'front_flush') {
      overhangFront = 0;
      overhangRear = Number(extra.toFixed(2));
    } else {
      // centered
      overhangFront = Number((extra * 0.5).toFixed(2));
      overhangRear = Number((extra * 0.5).toFixed(2));
    }
    totalOverhang = Number(extra.toFixed(2));
  } else if (frameType === 'rimless') {
    // In rimless, entire edge is exposed
    overhangFront = 0;
    overhangRear = Number(maxEdgeThickness.toFixed(2));
    totalOverhang = Number(maxEdgeThickness.toFixed(2));
  }

  // Reduction percentage vs baseline (1.50)
  let thicknessReductionPercent = 0;
  let weightReductionPercent = 0;

  if (baselineResult && baselineResult.maxEdgeThickness > 0) {
    const baseMetric = isOverallMinus ? baselineResult.maxEdgeThickness : baselineResult.centerThickness;
    const currentMetric = isOverallMinus ? maxEdgeThickness : centerThickness;
    thicknessReductionPercent = Math.max(0, Math.round(((baseMetric - currentMetric) / baseMetric) * 100));

    if (baselineResult.weightGrams > 0) {
      weightReductionPercent = Math.max(0, Math.round(((baselineResult.weightGrams - weightGrams) / baselineResult.weightGrams) * 100));
    }
  }

  // Suitability scoring
  const totalDiopter = Math.max(Math.abs(sph), Math.abs(sph + cyl));
  let suitabilityScore: LensCalculationResult['suitabilityScore'] = 'acceptable';
  let recommendationReason = '';

  if (frameType === 'rimless' || frameType === 'semi_rimless') {
    if (material.id === '1.50' || material.id === '1.56') {
      suitabilityScore = 'unsuitable';
      recommendationReason = 'Misinalı (Nilör) ve Vidalı (Faset) çerçevelerde kırılma ve çatlama riski yüksektir. 1.61 veya Trivex önerilir.';
    } else if (material.id === '1.61' || material.id === '1.53') {
      suitabilityScore = 'optimal';
      recommendationReason = 'Mükemmel esneklik ve tokluk. Faset ve nilör montajları için optisyenlerin 1 numaralı tercihidir.';
    }
  }

  if (suitabilityScore !== 'unsuitable') {
    if (totalDiopter <= 2.0) {
      if (material.id === '1.50') {
        suitabilityScore = 'optimal';
        recommendationReason = 'Bu numara aralığı için en ideal ve ekonomik camdır; maksimum optik netlik sunar.';
      } else if (material.id === '1.56') {
        suitabilityScore = 'recommended';
        recommendationReason = 'Hafif ve estetik bir alternatif.';
      } else {
        suitabilityScore = 'acceptable';
        recommendationReason = 'Düşük numaralarda yüksek indeks ekstra incelme sağlamaz, ancak tercih edilebilir.';
      }
    } else if (totalDiopter <= 3.75) {
      if (material.id === '1.56' || material.id === '1.61') {
        suitabilityScore = 'optimal';
        recommendationReason = 'Bu numara için en dengeli kalınlık, ağırlık ve optik netlik kombinasyonudur.';
      } else if (material.id === '1.50') {
        suitabilityScore = maxEdgeThickness > 4.5 ? 'too_thick' : 'acceptable';
        recommendationReason = 'Kenar kalınlığı belirginleşmeye başlar, çerçeveden hafif taşma yapabilir.';
      } else {
        suitabilityScore = 'recommended';
        recommendationReason = 'Daha ince profil isteyen müşteriler için uygundur.';
      }
    } else if (totalDiopter <= 5.50) {
      if (material.id === '1.61' || material.id === '1.67') {
        suitabilityScore = 'optimal';
        recommendationReason = 'Yüksek estetik ve hissedilir incelik. Çerçeve dışına taşmayı minimuma indirir.';
      } else if (material.id === '1.50') {
        suitabilityScore = 'too_thick';
        recommendationReason = 'Cam kenarları oldukça kalın ve ağır kalacaktır. İnceltme tavsiye edilir.';
      } else {
        suitabilityScore = 'recommended';
        recommendationReason = 'Çok ince kenar profili.';
      }
    } else {
      // High diopters > 5.50
      if (material.id === '1.67' || material.id === '1.74') {
        suitabilityScore = 'optimal';
        recommendationReason = 'Yüksek numaralarda estetik görünüm, hafiflik ve göz küçülmesini engellemek için şarttır.';
      } else if (material.id === '1.50' || material.id === '1.56') {
        suitabilityScore = 'too_thick';
        recommendationReason = 'Çok kalın şişe dibi görüntüsü oluşturur ve burna aşırı ağırlık yapar.';
      } else {
        suitabilityScore = 'acceptable';
        recommendationReason = 'Kabul edilebilir ancak 1.67 veya 1.74 çok daha estetiktir.';
      }
    }
  }

  return {
    material,
    surfaceTech,
    flatnessBonusPercent: tech.flatnessBonusPercent,
    clearVisionFieldMultiplier: tech.clearVisionFieldMultiplier,
    centerThickness: Number(centerThickness.toFixed(2)),
    maxEdgeThickness: Number(maxEdgeThickness.toFixed(2)),
    minEdgeThickness: Number(minEdgeThickness.toFixed(2)),
    nasalEdgeThickness: Number(nasalEdgeThickness.toFixed(2)),
    temporalEdgeThickness: Number(temporalEdgeThickness.toFixed(2)),
    superiorEdgeThickness: Number(superiorEdgeThickness.toFixed(2)),
    inferiorEdgeThickness: Number(inferiorEdgeThickness.toFixed(2)),
    weightGrams,
    thicknessReductionPercent,
    weightReductionPercent,
    frameRimThickness,
    overhangFront,
    overhangRear,
    totalOverhang,
    suitabilityScore,
    recommendationReason,
    perimeterPoints,
  };
}

/**
 * Computes calculations for all lens materials at once
 */
export function calculateAllIndices(
  prescription: EyePrescription,
  frame: FrameParameters,
  surfaceTech: SurfaceTechnology = 'spheric'
): LensCalculationResult[] {
  // First calculate baseline 1.50 with spherical surface for standard reference
  const baselineMaterial = LENS_MATERIALS.find((m) => m.id === '1.50') || LENS_MATERIALS[0];
  const baselineResult = calculateLensMetrics(prescription, frame, baselineMaterial, undefined, 'spheric');

  // Now calculate all materials with baseline comparison and specified surface technology
  return LENS_MATERIALS.map((mat) => {
    if (mat.id === '1.50' && surfaceTech === 'spheric') return baselineResult;
    return calculateLensMetrics(prescription, frame, mat, baselineResult, surfaceTech);
  });
}

/**
 * Computes comparison across all 4 surface technologies (Sferik, Asiferik, Bi-Asiferik, ZEISS ClearView)
 * for a specific lens material.
 */
export function calculateSurfaceTechComparison(
  prescription: EyePrescription,
  frame: FrameParameters,
  material: LensMaterial
): Array<{
  tech: SurfaceTechInfo;
  result: LensCalculationResult;
}> {
  // Baseline 1.50 spheric
  const baselineMaterial = LENS_MATERIALS.find((m) => m.id === '1.50') || LENS_MATERIALS[0];
  const baselineResult = calculateLensMetrics(prescription, frame, baselineMaterial, undefined, 'spheric');

  return SURFACE_TECHNOLOGIES.map((tech) => {
    const res = calculateLensMetrics(prescription, frame, material, baselineResult, tech.id);
    return {
      tech,
      result: res,
    };
  });
}

