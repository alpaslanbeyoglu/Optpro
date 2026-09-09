import React from 'react';
import { SurfaceTechnology, EyePrescription, FrameParameters, LensMaterial, LensCalculationResult } from '../types';
import { SURFACE_TECHNOLOGIES, calculateSurfaceTechComparison } from '../utils/opticsCalculations';
import { Sparkles, Eye, ShieldCheck, Check, Layers, Zap, Info } from 'lucide-react';

interface Props {
  prescription: EyePrescription;
  frame: FrameParameters;
  selectedMaterial: LensMaterial;
  activeSurfaceTech: SurfaceTechnology;
  onSelectSurfaceTech: (tech: SurfaceTechnology) => void;
}

export const SurfaceTechComparison: React.FC<Props> = ({
  prescription,
  frame,
  selectedMaterial,
  activeSurfaceTech,
  onSelectSurfaceTech,
}) => {
  const comparisonResults = calculateSurfaceTechComparison(
    prescription,
    frame,
    selectedMaterial
  );

  const activeItem = comparisonResults.find((c) => c.tech.id === activeSurfaceTech) || comparisonResults[0];
  const sphericBaseline = comparisonResults.find((c) => c.tech.id === 'spheric') || comparisonResults[0];

  return (
    <section id="surface-tech-section" className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-sm space-y-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-sm">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Cam Yüzey Tasarım Teknolojileri
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold">
                  Sferik • Asiferik • Bi-Asiferik • ZEISS ClearView
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Kırılma indeksinin yanı sıra camın yüzey geometrisi; kenar bombeliğini, distorsiyonu ve net görüş alanını belirler.
              </p>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl self-start md:self-auto font-medium">
          İncelenen Cam: <strong className="text-slate-800">{selectedMaterial.shortName}</strong> ({selectedMaterial.index})
        </div>
      </div>

      {/* 4 Technology Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {comparisonResults.map(({ tech, result }) => {
          const isSelected = tech.id === activeSurfaceTech;
          const isZeiss = tech.id === 'zeiss_clearview';
          const isBiAs = tech.id === 'biaspheric';

          // mm saved compared to spherical
          const mmSaved = sphericBaseline.result.maxEdgeThickness - result.maxEdgeThickness;

          return (
            <div
              key={tech.id}
              onClick={() => onSelectSurfaceTech(tech.id)}
              className={`relative rounded-2xl p-4 sm:p-5 border-2 cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? isZeiss
                    ? 'border-blue-600 bg-gradient-to-b from-blue-50/70 to-indigo-50/40 shadow-md ring-2 ring-blue-500/20'
                    : 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/70'
              }`}
            >
              {/* Top Row: Badge & Check */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isZeiss
                        ? 'bg-blue-600 text-white shadow-xs'
                        : isBiAs
                        ? 'bg-purple-100 text-purple-800'
                        : tech.id === 'aspheric'
                        ? 'bg-teal-100 text-teal-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isZeiss ? 'ZEISS FREEFORM' : tech.badge}
                  </span>

                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>

                {/* Tech Title */}
                <h4 className="font-extrabold text-slate-900 text-sm leading-snug">
                  {tech.name}
                </h4>

                <p className="text-[11px] text-slate-500 mt-1 line-clamp-3 leading-relaxed">
                  {tech.description}
                </p>
              </div>

              {/* Metrics & Impact */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                {/* Edge thickness with this tech */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Kenar Kalınlığı:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {result.maxEdgeThickness.toFixed(2)} mm
                    {mmSaved > 0.05 && (
                      <span className="ml-1 text-[10px] text-emerald-600 font-semibold">
                        (-{mmSaved.toFixed(1)}mm)
                      </span>
                    )}
                  </span>
                </div>

                {/* Field of View multiplier */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Berrak Görüş Alanı:</span>
                  <span className={`font-bold ${isZeiss ? 'text-blue-700 font-mono' : 'text-slate-700'}`}>
                    {tech.clearVisionFieldMultiplier > 1 ? `${tech.clearVisionFieldMultiplier}x Kat Geniş` : '1.0x (Standart)'}
                  </span>
                </div>

                {/* Flatness bonus */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Cam Bombeliği:</span>
                  <span className={`font-bold ${tech.flatnessBonusPercent > 0 ? 'text-emerald-700' : 'text-slate-600'}`}>
                    {tech.flatnessBonusPercent > 0 ? `%${tech.flatnessBonusPercent} Daha Düz` : 'Geleneksel Kavis'}
                  </span>
                </div>

                {/* Recommendation note */}
                <div className="text-[10px] text-slate-500 bg-slate-100/80 p-2 rounded-lg mt-2">
                  <strong className="text-slate-700">İdeal Kullanım:</strong> {tech.idealFor}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deep Dive & Optical Field Simulator (Selected Technology) */}
      <div className="bg-slate-950 text-white rounded-2xl p-5 sm:p-6 border border-slate-800">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Left info */}
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-sky-300 text-xs font-semibold border border-blue-500/30">
              <Zap className="w-3.5 h-3.5 text-sky-400" />
              <span>Teknoloji Karşılaştırması: {activeItem.tech.name}</span>
            </div>

            <h4 className="text-lg font-bold text-white tracking-tight">
              {activeItem.tech.id === 'zeiss_clearview' ? (
                'ZEISS ClearView: 700 Nokta Serbest Form Optimizasyonu'
              ) : activeItem.tech.id === 'biaspheric' ? (
                'Bi-Asiferik: Ön ve Arka Yüzeyde 360° Çift Asferik Düzeltme'
              ) : activeItem.tech.id === 'aspheric' ? (
                'Asiferik: Ön Yüzey Düzleştirme & Göz Küçülmesini Önleme'
              ) : (
                'Standart Sferik: Geleneksel Küresel Kavis'
              )}
            </h4>

            <p className="text-xs text-slate-300 leading-relaxed">
              {activeItem.tech.id === 'zeiss_clearview' ? (
                'Geleneksel stok camlar standart küresel kalıplarda üretilirken, ZEISS ClearView her bir diyoptriyi karmaşık FreeForm algoritmasıyla 700 bağımsız noktada işler. Bu sayede cam %49 daha düz bir estetik kazanır, kenar kalınlığı azalır ve merkezden çerçeve sınırına kadar 3 kat daha geniş kristal berraklık sağlanır.'
              ) : activeItem.tech.id === 'biaspheric' ? (
                'Bi-asiferik camlar hem ön hem de arka yüzeyinde ayrı ayrı asiferik eğriler barındırır. Özellikle astigmatı olan hastalarda iki ana meridyendeki kalınlık ve distorsiyon farkını eşitleyerek panoramik bir görüş konforu sunar.'
              ) : activeItem.tech.id === 'aspheric' ? (
                'Asiferik ön yüzey, camın dışarıya doğru olan kubbe kavisini düzleştirir. Miyop gözlüklerde dışarıdan bakıldığında gözlerin küçük görünmesini, hipermetrop camlarda ise iri görünmesini önler.'
              ) : (
                'Geleneksel küresel camlarda merkez optik eksen nettir ancak bakış kenarlara kaydıkça küresel sapınç (astigmatik aberration) nedeniyle bulanıklık ve kenar kalınlığı artar.'
              )}
            </p>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400">Net Görüş Alanı</div>
                <div className="text-base font-black text-sky-400 font-mono mt-0.5">
                  {activeItem.tech.clearVisionFieldMultiplier}x
                </div>
                <div className="text-[10px] text-slate-500">
                  {activeItem.tech.clearVisionFieldMultiplier === 3 ? '3 Kat Geniş' : 'Görüş Açısı'}
                </div>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400">Profil Düzlüğü</div>
                <div className="text-base font-black text-emerald-400 font-mono mt-0.5">
                  %{activeItem.tech.flatnessBonusPercent}
                </div>
                <div className="text-[10px] text-slate-500">Daha Düz Kavis</div>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400">Ekstra İncelme</div>
                <div className="text-base font-black text-amber-400 font-mono mt-0.5">
                  {activeItem.tech.thicknessFactor < 1
                    ? `%${Math.round((1 - activeItem.tech.thicknessFactor) * 100)}`
                    : 'Standart'}
                </div>
                <div className="text-[10px] text-slate-500">Kalınlık Tasarrufu</div>
              </div>
            </div>
          </div>

          {/* Right: Visual Lens Aperture & Field of View Diagram */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-900 rounded-2xl border border-slate-800 shrink-0 w-full sm:w-72">
            <span className="text-[11px] font-bold text-slate-300 mb-2">
              Optik Net Görüş Alanı Simülasyonu
            </span>

            {/* Concentric aperture diagram */}
            <div className="relative w-44 h-44 rounded-full border border-slate-700 flex items-center justify-center bg-slate-950 overflow-hidden shadow-inner">
              {/* Outer Aberration Ring (Bulanık Kenar Bölgesi) */}
              <div className="absolute inset-0 bg-rose-500/10 flex items-start justify-center pt-2">
                <span className="text-[9px] text-rose-400 font-mono">Kenar Sapıncı</span>
              </div>

              {/* Clear field circle based on multiplier */}
              <div
                className={`rounded-full flex items-center justify-center transition-all duration-500 shadow-md ${
                  activeItem.tech.id === 'zeiss_clearview'
                    ? 'w-40 h-40 bg-gradient-to-tr from-sky-400/30 to-blue-500/40 border-2 border-sky-400'
                    : activeItem.tech.id === 'biaspheric'
                    ? 'w-34 h-34 bg-gradient-to-tr from-purple-400/25 to-indigo-500/30 border-2 border-purple-400'
                    : activeItem.tech.id === 'aspheric'
                    ? 'w-28 h-28 bg-gradient-to-tr from-teal-400/20 to-emerald-500/25 border-2 border-teal-400'
                    : 'w-20 h-20 bg-gradient-to-tr from-slate-400/20 to-slate-500/20 border-2 border-slate-400'
                }`}
              >
                {/* Central pupil center */}
                <div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-white" />
                </div>
              </div>
            </div>

            <div className="text-center mt-3">
              <span className="text-xs font-bold text-sky-400 block">
                {activeItem.tech.id === 'zeiss_clearview'
                  ? 'Geniş Net Alan (%95+)'
                  : activeItem.tech.id === 'biaspheric'
                  ? 'Geniş Panoramik (%85)'
                  : activeItem.tech.id === 'aspheric'
                  ? 'Gelişmiş Alan (%70)'
                  : 'Dar Merkez Alanı (%45)'}
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {activeItem.tech.id === 'zeiss_clearview'
                  ? 'Merkezden çerçeve kenarına kadar kristal netlik'
                  : 'Kenarlarda optik netlik ve distorsiyon kontrolü'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
