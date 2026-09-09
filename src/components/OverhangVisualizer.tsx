import React from 'react';
import { LensCalculationResult, FrameParameters } from '../types';
import { ShieldCheck, AlertCircle, CheckCircle, Info, Sparkles } from 'lucide-react';

interface Props {
  selectedResult: LensCalculationResult;
  baselineResult: LensCalculationResult;
  frame: FrameParameters;
}

export const OverhangVisualizer: React.FC<Props> = ({
  selectedResult,
  baselineResult,
  frame,
}) => {
  const rimThick = selectedResult.frameRimThickness;
  const selT = selectedResult.maxEdgeThickness;
  const baseT = baselineResult.maxEdgeThickness;

  const selOverhang = Math.max(0, selT - rimThick);
  const baseOverhang = Math.max(0, baseT - rimThick);

  // In rimless, it's 100% exposed
  const isRimless = frame.frameType === 'rimless';

  return (
    <div id="overhang-visualizer-card" className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
            <Sparkles className="w-4 h-4" />
          </span>
          <h3 className="text-base font-bold text-slate-900">
            Çerçeveden Kenar Taşma Analizi (Bevel & Overhang)
          </h3>
        </div>
        <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
          Çerçeve Profili: {rimThick > 0 ? `${rimThick.toFixed(1)} mm` : 'Açık Kenar (Faset)'}
        </span>
      </div>

      <p className="text-xs text-slate-500 mt-2">
        Müşterilerinizin en çok merak ettiği "Gözlüğü taktığımda cam çerçeveden dışarı taşacak mı?" sorusunun yanıtı:
      </p>

      {/* Comparison visualization side-by-side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* 1.50 Standard Frame Overhang Box */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">1.50 Standart Organik Cam</span>
              <span className="text-xs font-mono font-bold text-slate-600">{baseT.toFixed(1)} mm</span>
            </div>

            {/* Visual Frame Overhang diagram */}
            <div className="my-3 p-4 bg-slate-900 rounded-lg flex items-center justify-center relative h-28 overflow-hidden">
              {/* Frame Rim bar */}
              <div
                className="bg-slate-700 border border-slate-500 rounded-xs flex items-center justify-center z-10"
                style={{
                  width: '60px',
                  height: `${Math.min(90, Math.max(20, rimThick * 12))}px`,
                }}
              >
                <span className="text-[9px] font-mono text-slate-300 transform -rotate-90">
                  Çerçeve
                </span>
              </div>

              {/* Lens protruding */}
              <div
                className="absolute bg-sky-400/40 border border-sky-400 rounded-xs z-0"
                style={{
                  width: '120px',
                  height: `${Math.min(100, Math.max(24, baseT * 12))}px`,
                }}
              />

              {baseOverhang > 0 && !isRimless && (
                <div className="absolute right-2 top-2 bg-amber-500/90 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded-md">
                  +{baseOverhang.toFixed(1)} mm Taşma
                </div>
              )}
            </div>

            {/* Status message */}
            <div className="text-xs">
              {baseOverhang > 0.5 ? (
                <div className="flex items-start gap-1.5 text-amber-700">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                  <span>Cam çerçevenin arkasından <strong>{baseOverhang.toFixed(1)} mm</strong> dışarı taşacaktır.</span>
                </div>
              ) : (
                <div className="flex items-start gap-1.5 text-emerald-700">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-600" />
                  <span>Çerçeve profili içine sığar.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Selected Index Overhang Box */}
        <div className="p-4 rounded-xl border border-blue-300 bg-blue-50/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900">
                {selectedResult.material.shortName} (Seçilen)
              </span>
              <span className="text-xs font-mono font-bold text-blue-700">{selT.toFixed(1)} mm</span>
            </div>

            {/* Visual Frame Overhang diagram */}
            <div className="my-3 p-4 bg-slate-900 rounded-lg flex items-center justify-center relative h-28 overflow-hidden">
              {/* Frame Rim bar */}
              <div
                className="bg-slate-700 border border-slate-500 rounded-xs flex items-center justify-center z-10"
                style={{
                  width: '60px',
                  height: `${Math.min(90, Math.max(20, rimThick * 12))}px`,
                }}
              >
                <span className="text-[9px] font-mono text-slate-300 transform -rotate-90">
                  Çerçeve
                </span>
              </div>

              {/* Lens protruding (thinner) */}
              <div
                className="absolute bg-emerald-400/40 border border-emerald-400 rounded-xs z-0"
                style={{
                  width: '120px',
                  height: `${Math.min(100, Math.max(20, selT * 12))}px`,
                }}
              />

              {!isRimless && (
                <div
                  className={`absolute right-2 top-2 font-bold text-[10px] px-2 py-0.5 rounded-md ${
                    selOverhang > 0.2
                      ? 'bg-amber-500/90 text-slate-950'
                      : 'bg-emerald-500 text-white'
                  }`}
                >
                  {selOverhang > 0.2 ? `+${selOverhang.toFixed(1)} mm Taşma` : 'Sıfır Taşma'}
                </div>
              )}
            </div>

            {/* Status message */}
            <div className="text-xs">
              {selOverhang <= 0.2 ? (
                <div className="flex items-start gap-1.5 text-emerald-800 font-semibold">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-600" />
                  <span>
                    Mükemmel uyum! Cam kenarı çerçevenin et kalınlığı içinde tamamen gizlenir.
                  </span>
                </div>
              ) : (
                <div className="flex items-start gap-1.5 text-blue-900">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-600" />
                  <span>
                    Standart cama göre taşma <strong>{(baseOverhang - selOverhang).toFixed(1)} mm</strong> azaltıldı.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
