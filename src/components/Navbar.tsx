import React from 'react';
import { Glasses, Presentation, Printer, Eye, RotateCcw } from 'lucide-react';
import { EyeType } from '../types';

interface Props {
  activeEye: EyeType;
  onEyeChange: (eye: EyeType) => void;
  onOpenPresentation: () => void;
  onOpenPrint: () => void;
  onReset: () => void;
  patientName: string;
}

export const Navbar: React.FC<Props> = ({
  activeEye,
  onEyeChange,
  onOpenPresentation,
  onOpenPrint,
  onReset,
  patientName,
}) => {
  return (
    <header id="main-header" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Glasses className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-tight">
                OPTİK KALINLIK SİMÜLATÖRÜ
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Optisyen Pro
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Gözlük Camı Reçete & İndeks Kalınlık Danışmanlığı
            </p>
          </div>
        </div>

        {/* Eye quick toggle (Middle) */}
        <div className="hidden md:flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/60">
          <button
            type="button"
            onClick={() => onEyeChange('OD')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeEye === 'OD'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Sağ Göz (OD)</span>
          </button>
          <button
            type="button"
            onClick={() => onEyeChange('OS')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeEye === 'OS'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Sol Göz (OS)</span>
          </button>
        </div>

        {/* Actions (Customer presentation & print) */}
        <div className="flex items-center gap-2">
          {patientName && (
            <span className="hidden lg:inline-block text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
              Müşteri: <strong className="text-slate-900">{patientName}</strong>
            </span>
          )}

          <button
            type="button"
            id="btn-nav-presentation"
            onClick={onOpenPresentation}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <Presentation className="w-4 h-4" />
            <span className="hidden sm:inline">Müşteriye Sun</span>
            <span className="sm:hidden">Sunum</span>
          </button>

          <button
            type="button"
            id="btn-nav-print"
            onClick={onOpenPrint}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
            title="Teklif Fişi Yazdır"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Teklif Fişi</span>
          </button>
        </div>
      </div>
    </header>
  );
};
