import React, { useState } from 'react';
import { LensCalculationResult, EyePrescription, FrameParameters } from '../types';
import { X, Sparkles, CheckCircle2, ArrowRight, Printer, Glasses, Eye, ShieldCheck, Feather, Heart } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedResult: LensCalculationResult;
  baselineResult: LensCalculationResult; // 1.50
  prescription: EyePrescription;
  frame: FrameParameters;
  patientName: string;
  onOpenPrintModal: () => void;
}

export const CustomerPresentationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  selectedResult,
  baselineResult,
  prescription,
  frame,
  patientName,
  onOpenPrintModal,
}) => {
  if (!isOpen) return null;

  const [compareSlider, setCompareSlider] = useState<number>(50); // percentage split

  const baseT = baselineResult.maxEdgeThickness;
  const selT = selectedResult.maxEdgeThickness;
  const diffMm = (baseT - selT).toFixed(1);
  const diffPercent = selectedResult.thicknessReductionPercent;
  const weightDiff = (baselineResult.weightGrams - selectedResult.weightGrams).toFixed(1);

  return (
    <div id="customer-presentation-modal" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-blue-50/70 to-indigo-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-600 text-white shadow-sm">
                <Glasses className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  Cam Kalınlığı & Estetik Danışmanlığı
                </h2>
                <p className="text-xs text-slate-600">
                  {patientName ? `${patientName} İçin Özel Karşılaştırma` : 'Müşteri Bilgilendirme Sunumu'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenPrintModal}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-blue-600" />
              <span>Teklif Fişi Yazdır</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Prescription Summary Bar */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Reçete Değeri:</span>
            <span className="font-mono font-bold bg-slate-800 px-2.5 py-1 rounded-md text-sky-400">
              SPH: {prescription.sph > 0 ? `+${prescription.sph.toFixed(2)}` : prescription.sph.toFixed(2)}
            </span>
            {Math.abs(prescription.cyl) > 0 && (
              <span className="font-mono font-bold bg-slate-800 px-2.5 py-1 rounded-md text-amber-400">
                CYL: {prescription.cyl.toFixed(2)} @ {prescription.axis}°
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-slate-300">
            <span>Çerçeve: <strong>{frame.a} Ekartman</strong></span>
            <span>•</span>
            <span>
              Tip:{' '}
              <strong>
                {frame.frameType === 'acetate'
                  ? 'Kemik / Asetat'
                  : frame.frameType === 'metal'
                  ? 'İnce Metal'
                  : frame.frameType === 'semi_rimless'
                  ? 'Nilör'
                  : 'Faset'}
              </strong>
            </span>
            <span>•</span>
            <span>
              Pupil Yüksekliği (Alt Kenardan): <strong className="text-white font-mono">{prescription.height} mm</strong>
            </span>
          </div>
        </div>

        {/* Big Visual Comparison Cards */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Surface Tech Highlights Banner */}
          {selectedResult.surfaceTech && selectedResult.surfaceTech !== 'spheric' && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md border border-blue-700/50">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-blue-500/20 text-sky-300 border border-blue-400/30">
                  <Sparkles className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>
                      {selectedResult.surfaceTech === 'zeiss_clearview'
                        ? 'ZEISS ClearView FreeForm Teknolojisi'
                        : selectedResult.surfaceTech === 'biaspheric'
                        ? 'Bi-Asiferik Çift Yüzey Teknolojisi'
                        : 'Asiferik (AS) Yüzey Teknolojisi'}
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-500 text-white">
                      {selectedResult.clearVisionFieldMultiplier}x Geniş Görüş
                    </span>
                  </h4>
                  <p className="text-xs text-sky-200 mt-0.5">
                    {selectedResult.surfaceTech === 'zeiss_clearview'
                      ? 'Standart camlara kıyasla 3 kat daha geniş net görüş alanı, %49 daha düz kavis ve %16 ekstra incelik.'
                      : selectedResult.surfaceTech === 'biaspheric'
                      ? 'Çift yüzey asiferik optik ile kenarlardaki bulanıklık sıfırlanır, astigmatta geniş panoramik netlik sunar.'
                      : 'Ön yüzey düzleştirilmiştir, gözlerin dışarıdan doğal boyutunda görünmesini sağlar.'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-sky-300 shrink-0">
                <span className="px-2.5 py-1 rounded-lg bg-white/10">
                  %{selectedResult.flatnessBonusPercent} Daha Düz Profil
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Standard 1.50 Card */}
            <div className="rounded-2xl p-6 border-2 border-slate-200 bg-slate-50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Standart Seçenek
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded-md">
                    1.50 İndeks
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mt-1">
                  Standart İnceltilmemiş Cam
                </h3>

                {/* Big Metric Display */}
                <div className="my-5 p-4 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 block">En Kalın Kenar</span>
                    <span className="text-3xl font-extrabold font-mono text-slate-900">
                      {baseT.toFixed(1)} <span className="text-base font-normal">mm</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Ağırlık</span>
                    <span className="text-xl font-bold font-mono text-slate-700">
                      {baselineResult.weightGrams} gr
                    </span>
                  </div>
                </div>

                {/* Visual side cross section representation */}
                <div className="p-4 rounded-xl bg-slate-900 flex items-center justify-center relative overflow-hidden h-24">
                  {/* Thick lens silhouette */}
                  <div
                    className="bg-sky-400/40 border border-sky-400 rounded-md transition-all"
                    style={{
                      width: '180px',
                      height: `${Math.min(75, baseT * 10)}px`,
                    }}
                  />
                  <span className="absolute bottom-2 text-[10px] text-slate-400 font-mono">
                    Kalınlık Profili ({baseT.toFixed(1)} mm)
                  </span>
                </div>

                {/* Customer perception */}
                <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                  <p className="flex items-start gap-1.5 text-amber-700">
                    <span>⚠️</span>
                    <span>Çerçeve kenarlarından belirgin taşma yapabilir.</span>
                  </p>
                  <p className="flex items-start gap-1.5 text-slate-500">
                    <span>•</span>
                    <span>Gözlerde küçülme veya şişe dibi halkaları oluşabilir.</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Recommended High Index Card */}
            <div className="rounded-2xl p-6 border-2 border-blue-600 bg-gradient-to-b from-blue-50/50 to-indigo-50/30 flex flex-col justify-between relative shadow-lg">
              <div className="absolute -top-3 right-6 bg-blue-600 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>ÖNERİLEN SEÇİM</span>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                    {selectedResult.material.reductionLabel}
                  </span>
                  <span className="text-xs font-mono font-extrabold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                    {selectedResult.material.id} İndeks
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {selectedResult.material.name}
                </h3>

                {/* Big Metric Display */}
                <div className="my-5 p-4 rounded-xl bg-white border border-blue-200 flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-xs text-slate-500 block">En Kalın Kenar</span>
                    <span className="text-3xl font-extrabold font-mono text-blue-700">
                      {selT.toFixed(1)} <span className="text-base font-normal">mm</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Hafiflik</span>
                    <span className="text-xl font-bold font-mono text-emerald-600">
                      {selectedResult.weightGrams} gr
                    </span>
                  </div>
                </div>

                {/* Visual side cross section representation */}
                <div className="p-4 rounded-xl bg-slate-900 flex items-center justify-center relative overflow-hidden h-24">
                  {/* Thinner lens silhouette */}
                  <div
                    className="bg-gradient-to-r from-emerald-400 to-sky-400 border border-emerald-300 rounded-md transition-all shadow-md shadow-emerald-500/30"
                    style={{
                      width: '180px',
                      height: `${Math.min(75, selT * 10)}px`,
                    }}
                  />
                  <span className="absolute bottom-2 text-[10px] text-emerald-400 font-mono font-bold">
                    İnceltilmiş Profil ({selT.toFixed(1)} mm)
                  </span>
                </div>

                {/* Savings Highlights */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-emerald-100/80 text-emerald-900 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>%{diffPercent} Daha İnce (-{diffMm} mm)</span>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-100/80 text-blue-900 font-bold flex items-center gap-1.5">
                    <Feather className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{weightDiff} gr Daha Hafif</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Value Proposition Checklist */}
          <div className="rounded-2xl p-6 bg-slate-50 border border-slate-200">
            <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>İnceltilmiş Cam Seçtiğinizde Ne Kazanırsınız?</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-200/70">
                <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 shrink-0">
                  <Eye className="w-4 h-4" />
                </span>
                <div>
                  <h5 className="font-bold text-slate-900">Doğal Göz Görünümü</h5>
                  <p className="text-slate-500 mt-0.5">
                    Gözlerinizin dışarıdan küçük veya büyük görünmesini engelleyerek estetik bakışlar sunar.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-200/70">
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 shrink-0">
                  <Feather className="w-4 h-4" />
                </span>
                <div>
                  <h5 className="font-bold text-slate-900">Burna Baskı Yapmaz</h5>
                  <p className="text-slate-500 mt-0.5">
                    Hafifletilmiş yapısıyla burun kemiğinde kırmızı baskı izi ve kulak arkası ağrısı oluşturmaz.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-200/70">
                <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div>
                  <h5 className="font-bold text-slate-900">Çerçeve İçi Kusursuzluk</h5>
                  <p className="text-slate-500 mt-0.5">
                    Cam çerçevenin kenarlarından taşmaz; şık ve kaliteli bir gözlük tasarımı sağlar.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="text-xs text-slate-500">
              * Kalınlıklar optik laboratuvar üretim parametreleri ve asferik yüzey baz alınarak simüle edilmiştir.
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                Geri Dön
              </button>
              <button
                type="button"
                onClick={onOpenPrintModal}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Teklif Formunu Yazdır</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
