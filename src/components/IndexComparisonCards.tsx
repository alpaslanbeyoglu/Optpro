import React, { useState } from 'react';
import { LensCalculationResult } from '../types';
import { Check, Star, AlertTriangle, XCircle, ArrowDownRight, ShieldCheck, Scale } from 'lucide-react';

interface Props {
  results: LensCalculationResult[];
  selectedId: string;
  onSelect: (materialId: string) => void;
}

export const IndexComparisonCards: React.FC<Props> = ({
  results,
  selectedId,
  onSelect,
}) => {
  const [showSpecialtyMaterials, setShowSpecialtyMaterials] = useState<boolean>(false);

  // Standard index list: 1.50, 1.56, 1.61, 1.67, 1.74
  const standardResults = results.filter((r) => ['1.50', '1.56', '1.61', '1.67', '1.74'].includes(r.material.id));
  const specialtyResults = results.filter((r) => ['1.59', '1.53'].includes(r.material.id));

  const displayList = showSpecialtyMaterials ? [...standardResults, ...specialtyResults] : standardResults;

  // Max edge thickness across all to normalize visual bars
  const maxAcrossAll = Math.max(...results.map((r) => r.maxEdgeThickness), 4.0);

  const getBadgeForScore = (score: LensCalculationResult['suitabilityScore']) => {
    switch (score) {
      case 'optimal':
        return {
          text: 'En İdeal Seçim',
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          icon: Star,
        };
      case 'recommended':
        return {
          text: 'Tavsiye Edilen',
          bg: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: Check,
        };
      case 'acceptable':
        return {
          text: 'Standart / Uygun',
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          icon: Check,
        };
      case 'too_thick':
        return {
          text: 'Çok Kalın Kalır',
          bg: 'bg-amber-100 text-amber-800 border-amber-300',
          icon: AlertTriangle,
        };
      case 'unsuitable':
        return {
          text: 'Montaja Uygun Değil',
          bg: 'bg-rose-100 text-rose-800 border-rose-300',
          icon: XCircle,
        };
    }
  };

  return (
    <div id="index-comparison-section" className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              Kırılma İndeksleri & İnceltme Karşılaştırması
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              5 Farklı İndeks
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            İndeks yükseldikçe camın ışığı kırma gücü artar, kenar kalınlığı ve ağırlığı dramatik biçimde düşer.
          </p>
        </div>

        {/* Toggle specialty materials */}
        <button
          type="button"
          id="btn-toggle-specialty"
          onClick={() => setShowSpecialtyMaterials(!showSpecialtyMaterials)}
          className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
        >
          {showSpecialtyMaterials ? 'Özel Camları Gizle' : '+ Polikarbon & Trivex Ekle'}
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-4">
        {displayList.map((res) => {
          const isSelected = res.material.id === selectedId;
          const badge = getBadgeForScore(res.suitabilityScore);
          const BadgeIcon = badge.icon;
          const barPercent = Math.min(100, Math.max(15, (res.maxEdgeThickness / maxAcrossAll) * 100));

          return (
            <div
              key={res.material.id}
              onClick={() => onSelect(res.material.id)}
              className={`relative rounded-2xl p-4 border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-600/30 shadow-md'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              {/* Selected indicator checkmark */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}

              {/* Title & Badge */}
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-extrabold text-slate-900 font-mono">
                    {res.material.id}
                  </span>
                  <span className="text-xs font-semibold text-slate-600">
                    {res.material.id === '1.50' ? 'Standart' : res.material.reductionLabel}
                  </span>
                </div>

                <div className="mt-2">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge.bg}`}
                  >
                    <BadgeIcon className="w-2.5 h-2.5" />
                    <span>{badge.text}</span>
                  </span>
                </div>

                {/* Thickness visual representation bar */}
                <div className="mt-3.5 pt-3 border-t border-slate-100">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[11px] text-slate-500 font-medium">En Kalın Kenar</span>
                    <span className="text-base font-extrabold font-mono text-slate-900">
                      {res.maxEdgeThickness.toFixed(2)} mm
                    </span>
                  </div>

                  {/* Relative bar */}
                  <div className="w-full bg-slate-100 h-2 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        res.suitabilityScore === 'too_thick'
                          ? 'bg-amber-500'
                          : res.suitabilityScore === 'unsuitable'
                          ? 'bg-rose-500'
                          : 'bg-blue-600'
                      }`}
                      style={{ width: `${barPercent}%` }}
                    />
                  </div>

                  {/* Reduction percentage tag */}
                  {res.thicknessReductionPercent > 0 && (
                    <div className="flex items-center gap-1 mt-1 text-[11px] font-bold text-emerald-600">
                      <ArrowDownRight className="w-3 h-3" />
                      <span>%{res.thicknessReductionPercent} İnceltme</span>
                    </div>
                  )}
                  {res.thicknessReductionPercent === 0 && (
                    <div className="text-[10px] text-slate-400 mt-1">Standart Baz Kalınlık</div>
                  )}
                </div>

                {/* Key Metrics: Center, Weight, Overhang */}
                <div className="mt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span className="text-[11px] text-slate-500">Merkez (CT):</span>
                    <span className="font-mono font-semibold">{res.centerThickness.toFixed(1)} mm</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="text-[11px] text-slate-500">Tahmini Ağırlık:</span>
                    <span className="font-mono font-semibold">{res.weightGrams} gr</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="text-[11px] text-slate-500">Çerçeve Taşması:</span>
                    <span
                      className={`font-mono font-semibold ${
                        res.totalOverhang > 0 ? 'text-amber-600' : 'text-emerald-600'
                      }`}
                    >
                      {res.totalOverhang > 0 ? `+${res.totalOverhang.toFixed(1)} mm` : 'Yok'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-100">
                    <span className="text-[11px] text-slate-500">Abbe Değeri:</span>
                    <span className="font-mono font-semibold text-slate-700">{res.material.abbeValue}</span>
                  </div>
                </div>
              </div>

              {/* Action button */}
              <div className="mt-4 pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(res.material.id);
                  }}
                  className={`w-full py-1.5 rounded-xl text-xs font-bold transition-all text-center ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {isSelected ? 'İnceleniyor' : 'Seç & Kıyasla'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
