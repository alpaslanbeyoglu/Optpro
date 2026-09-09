import React from 'react';
import { EyePrescription, EyeType, PrescriptionPreset } from '../types';
import { PRESCRIPTION_PRESETS } from '../utils/opticsCalculations';
import { Eye, Copy, Sparkles, User, FileText, ChevronRight, RotateCcw } from 'lucide-react';

interface Props {
  activeEye: EyeType;
  prescription: EyePrescription;
  patientName: string;
  notes: string;
  onEyeChange: (eye: EyeType) => void;
  onPrescriptionChange: (field: keyof EyePrescription, value: number) => void;
  onCopyODtoOS: () => void;
  onPresetSelect: (preset: PrescriptionPreset) => void;
  onPatientNameChange: (name: string) => void;
  onNotesChange: (notes: string) => void;
  onReset: () => void;
}

export const PrescriptionInput: React.FC<Props> = ({
  activeEye,
  prescription,
  patientName,
  notes,
  onEyeChange,
  onPrescriptionChange,
  onCopyODtoOS,
  onPresetSelect,
  onPatientNameChange,
  onNotesChange,
  onReset,
}) => {
  const { sph, cyl, axis, pdMono, height } = prescription;

  const adjustValue = (field: keyof EyePrescription, delta: number, min: number, max: number) => {
    const current = prescription[field];
    const updated = Math.min(max, Math.max(min, Number((current + delta).toFixed(2))));
    onPrescriptionChange(field, updated);
  };

  return (
    <div id="prescription-input-card" className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm">
      {/* Eye Switcher & Quick Tools */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl w-fit">
          <button
            type="button"
            id="tab-eye-od"
            onClick={() => onEyeChange('OD')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeEye === 'OD'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Sağ Göz (OD)</span>
          </button>
          <button
            type="button"
            id="tab-eye-os"
            onClick={() => onEyeChange('OS')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeEye === 'OS'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Sol Göz (OS)</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="btn-copy-od-os"
            onClick={onCopyODtoOS}
            title="Sağ göz değerlerini sol göze aynen kopyala"
            className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-1"
          >
            <Copy className="w-3.5 h-3.5 text-slate-500" />
            <span>Sağ'ı Sol'a Eşitle</span>
          </button>

          <button
            type="button"
            id="btn-reset-prescription"
            onClick={onReset}
            title="Sıfırla"
            className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Prescription Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        {/* SPH (Sferik) */}
        <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <label htmlFor="input-sph" className="text-xs font-bold text-slate-700">
              SPH (Sferik)
            </label>
            <span className="text-[11px] text-slate-500">Miyop (-) / Hipermetrop (+)</span>
          </div>

          <div className="flex items-center justify-between gap-2 mt-2">
            <button
              type="button"
              id="btn-sph-minus"
              onClick={() => adjustValue('sph', -0.25, -15, 10)}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 font-bold text-slate-700 flex items-center justify-center text-sm shadow-xs"
            >
              -
            </button>
            <div className="relative flex-1">
              <input
                id="input-sph"
                type="number"
                step="0.25"
                min="-15"
                max="10"
                value={sph}
                onChange={(e) => onPrescriptionChange('sph', parseFloat(e.target.value) || 0)}
                className="w-full text-center font-mono font-bold text-base bg-white border border-slate-300 rounded-lg py-1 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute right-2 top-1.5 text-[11px] text-slate-400 font-mono">D</span>
            </div>
            <button
              type="button"
              id="btn-sph-plus"
              onClick={() => adjustValue('sph', 0.25, -15, 10)}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 font-bold text-slate-700 flex items-center justify-center text-sm shadow-xs"
            >
              +
            </button>
          </div>

          {/* Quick SPH slider */}
          <div className="mt-2.5">
            <input
              type="range"
              min="-12"
              max="8"
              step="0.25"
              value={sph}
              onChange={(e) => onPrescriptionChange('sph', parseFloat(e.target.value))}
              className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* CYL (Silindirik / Astigmat) */}
        <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <label htmlFor="input-cyl" className="text-xs font-bold text-slate-700">
              CYL (Silindirik)
            </label>
            <span className="text-[11px] text-slate-500">Astigmat Değeri</span>
          </div>

          <div className="flex items-center justify-between gap-2 mt-2">
            <button
              type="button"
              id="btn-cyl-minus"
              onClick={() => adjustValue('cyl', -0.25, -6, 4)}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 font-bold text-slate-700 flex items-center justify-center text-sm shadow-xs"
            >
              -
            </button>
            <div className="relative flex-1">
              <input
                id="input-cyl"
                type="number"
                step="0.25"
                min="-6"
                max="4"
                value={cyl}
                onChange={(e) => onPrescriptionChange('cyl', parseFloat(e.target.value) || 0)}
                className="w-full text-center font-mono font-bold text-base bg-white border border-slate-300 rounded-lg py-1 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute right-2 top-1.5 text-[11px] text-slate-400 font-mono">D</span>
            </div>
            <button
              type="button"
              id="btn-cyl-plus"
              onClick={() => adjustValue('cyl', 0.25, -6, 4)}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 font-bold text-slate-700 flex items-center justify-center text-sm shadow-xs"
            >
              +
            </button>
          </div>

          {/* Quick CYL slider */}
          <div className="mt-2.5">
            <input
              type="range"
              min="-5"
              max="0"
              step="0.25"
              value={cyl}
              onChange={(e) => onPrescriptionChange('cyl', parseFloat(e.target.value))}
              className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* AKS (Axis) */}
        <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <label htmlFor="input-axis" className="text-xs font-bold text-slate-700">
              AKS (Açı)
            </label>
            <span className="text-[11px] text-slate-500">1° - 180° Derece</span>
          </div>

          <div className="flex items-center justify-between gap-2 mt-2">
            <button
              type="button"
              id="btn-axis-minus"
              onClick={() => adjustValue('axis', -5, 1, 180)}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 font-bold text-slate-700 flex items-center justify-center text-xs shadow-xs"
            >
              -5°
            </button>
            <div className="relative flex-1">
              <input
                id="input-axis"
                type="number"
                min="1"
                max="180"
                value={axis}
                onChange={(e) => onPrescriptionChange('axis', Math.min(180, Math.max(1, parseInt(e.target.value) || 180)))}
                className="w-full text-center font-mono font-bold text-base bg-white border border-slate-300 rounded-lg py-1 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute right-2 top-1.5 text-[11px] text-slate-400 font-mono">°</span>
            </div>
            <button
              type="button"
              id="btn-axis-plus"
              onClick={() => adjustValue('axis', 5, 1, 180)}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 font-bold text-slate-700 flex items-center justify-center text-xs shadow-xs"
            >
              +5°
            </button>
          </div>

          {/* Quick Axis presets */}
          <div className="flex items-center justify-between gap-1 mt-2.5">
            {[180, 90, 45, 135].map((ang) => (
              <button
                key={ang}
                type="button"
                onClick={() => onPrescriptionChange('axis', ang)}
                className={`text-[10px] font-semibold py-0.5 px-2 rounded-md border transition-colors ${
                  axis === ang
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {ang}°
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pupil & Fitting Height Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between gap-3 bg-slate-50/50 p-2.5 rounded-xl border border-slate-200/60">
          <div>
            <label htmlFor="input-pd" className="text-xs font-bold text-slate-700 block">
              Gözbebeği Mesafesi (PD / Pupilla)
            </label>
            <span className="text-[11px] text-slate-500">Monoküler PD (Burun kökünden göze)</span>
          </div>
          <div className="flex items-center gap-1.5 w-28">
            <input
              id="input-pd"
              type="number"
              min="24"
              max="40"
              step="0.5"
              value={pdMono}
              onChange={(e) => onPrescriptionChange('pdMono', parseFloat(e.target.value) || 31)}
              className="w-full text-center font-mono font-bold text-sm bg-white border border-slate-300 rounded-lg py-1 text-slate-900"
            />
            <span className="text-xs font-mono text-slate-500">mm</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 bg-slate-50/50 p-2.5 rounded-xl border border-slate-200/60">
          <div>
            <label htmlFor="input-height" className="text-xs font-bold text-slate-700 block">
              Montaj Yüksekliği (H - Alt Kenardan)
            </label>
            <span className="text-[11px] text-blue-700 font-medium">Şablonun en alt kenarından pupile</span>
          </div>
          <div className="flex items-center gap-1.5 w-28">
            <input
              id="input-height"
              type="number"
              min="14"
              max="32"
              step="0.5"
              value={height}
              onChange={(e) => onPrescriptionChange('height', parseFloat(e.target.value) || 20)}
              className="w-full text-center font-mono font-bold text-sm bg-white border border-slate-300 rounded-lg py-1 text-slate-900"
            />
            <span className="text-xs font-mono text-slate-500">mm</span>
          </div>
        </div>
      </div>

      {/* Quick Prescription Presets (Fast optician demos) */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-slate-700">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Hızlı Reçete Örnekleri (Müşteriye Anlık Gösterim)</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {PRESCRIPTION_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onPresetSelect(preset)}
              className="shrink-0 text-left px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 text-slate-700 transition-colors"
            >
              <div className="text-xs font-semibold text-slate-800">{preset.label}</div>
              <div className="text-[10px] font-mono text-blue-600">{preset.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Patient Name for Optician's Quote Slip */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
        <div className="w-full sm:w-1/2 flex items-center gap-2">
          <User className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Müşteri Adı Soyadı (Örn: Ahmet Yılmaz)"
            value={patientName}
            onChange={(e) => onPatientNameChange(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="w-full sm:w-1/2 flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Reçete / Mağaza Notu (Örn: Titanyum çerçeve için inceltme)"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
};
