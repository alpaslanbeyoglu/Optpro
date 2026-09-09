import React from 'react';
import { FrameParameters, FrameType, FrameShape, BevelPosition } from '../types';
import { Glasses, Sliders, Info, ShieldAlert } from 'lucide-react';

interface Props {
  frame: FrameParameters;
  onChange: (field: keyof FrameParameters, value: any) => void;
}

export const FrameSelector: React.FC<Props> = ({ frame, onChange }) => {
  const { a, b, dbl, frameType, shape, bevelPosition } = frame;

  const frameTypes: Array<{
    id: FrameType;
    label: string;
    profileMm: string;
    description: string;
    badge?: string;
  }> = [
    {
      id: 'acetate',
      label: 'Kemik / Asetat',
      profileMm: '4.2 mm',
      description: 'Kalın gövdesiyle cam kenar kalınlığını en iyi gizleyen çerçeve türüdür.',
      badge: 'Kamuflaj',
    },
    {
      id: 'metal',
      label: 'İnce Metal',
      profileMm: '2.1 mm',
      description: 'İnce profil; kalın camlarda kenar taşması belirgin şekilde görünür.',
    },
    {
      id: 'semi_rimless',
      label: 'Nilör (Yarı Çerçeve)',
      profileMm: '1.8 mm / Misina',
      description: 'Altı misinalı kanal. Çatlamayı önlemek için 1.61 veya Trivex cam önerilir.',
      badge: '1.61 Önerilir',
    },
    {
      id: 'rimless',
      label: 'Faset (Çerçevesiz)',
      profileMm: '0 mm (Açıkta)',
      description: 'Vidalı montaj. Cam kenarları tamamen açıktır. 1.50/1.56 kullanılmamalıdır.',
      badge: 'Özel Montaj',
    },
  ];

  const shapes: Array<{ id: FrameShape; label: string; tip: string }> = [
    { id: 'round', label: 'Yuvarlak', tip: 'En ince kenar sonucu verir' },
    { id: 'rectangular', label: 'Dikdörtgen / Köşeli', tip: 'Köşelerde kalınlık artar' },
    { id: 'oval', label: 'Oval', tip: 'Dengeli kenar dağılımı' },
    { id: 'cateye', label: 'Çekik (Kedi Gözü)', tip: 'Üst şakakta kalınlaşır' },
    { id: 'aviator', label: 'Damla (Aviator)', tip: 'Alt kısım geniştir' },
  ];

  return (
    <div id="frame-selector-card" className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
            <Glasses className="w-4 h-4" />
          </span>
          <h3 className="text-base font-bold text-slate-900">
            Çerçeve Tipi & Geometri Ayarları
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
          {a}□{dbl} - {b}mm
        </span>
      </div>

      {/* Frame Dimensions (Ekartman A, Yükseklik B, Köprü DBL) */}
      <div className="grid grid-cols-3 gap-3 pt-4">
        {/* Ekartman A */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
          <div className="flex items-center justify-between">
            <label htmlFor="frame-a" className="text-xs font-bold text-slate-700">
              Ekartman (A)
            </label>
            <span className="text-[11px] font-mono text-blue-600 font-bold">{a} mm</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Cam yatay genişliği</p>
          <input
            id="frame-a"
            type="range"
            min="46"
            max="60"
            step="1"
            value={a}
            onChange={(e) => onChange('a', parseInt(e.target.value))}
            className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer mt-2"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
            <span>46mm</span>
            <span>52mm</span>
            <span>60mm</span>
          </div>
        </div>

        {/* Yükseklik B */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
          <div className="flex items-center justify-between">
            <label htmlFor="frame-b" className="text-xs font-bold text-slate-700">
              Yükseklik (B)
            </label>
            <span className="text-[11px] font-mono text-blue-600 font-bold">{b} mm</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Cam dikey yüksekliği</p>
          <input
            id="frame-b"
            type="range"
            min="30"
            max="50"
            step="1"
            value={b}
            onChange={(e) => onChange('b', parseInt(e.target.value))}
            className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer mt-2"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
            <span>30mm</span>
            <span>40mm</span>
            <span>50mm</span>
          </div>
        </div>

        {/* Köprü DBL */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
          <div className="flex items-center justify-between">
            <label htmlFor="frame-dbl" className="text-xs font-bold text-slate-700">
              Köprü (DBL)
            </label>
            <span className="text-[11px] font-mono text-blue-600 font-bold">{dbl} mm</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Burun aralığı mesafesi</p>
          <input
            id="frame-dbl"
            type="range"
            min="14"
            max="24"
            step="1"
            value={dbl}
            onChange={(e) => onChange('dbl', parseInt(e.target.value))}
            className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer mt-2"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
            <span>14mm</span>
            <span>18mm</span>
            <span>24mm</span>
          </div>
        </div>
      </div>

      {/* Frame Types Selection */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <label className="text-xs font-bold text-slate-700 block mb-2">
          Çerçeve Materyali & Montaj Tipi
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {frameTypes.map((ft) => {
            const isSelected = frameType === ft.id;
            return (
              <button
                key={ft.id}
                type="button"
                onClick={() => onChange('frameType', ft.id)}
                className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80 text-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-900">{ft.label}</span>
                    {ft.badge && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-800">
                        {ft.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-emerald-700 font-semibold block mt-0.5">
                    Et Payı: {ft.profileMm}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5 leading-snug line-clamp-2">
                  {ft.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Frame Shape Selection */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-slate-700 block">
            Çerçeve Formu (Kenar Kalınlık Dağılımı)
          </label>
          <span className="text-[11px] text-slate-500 italic">
            Küçük ve yuvarlak çerçevelerde kenar kalınlığı minimumda kalır
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {shapes.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onChange('shape', s.id)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors font-medium flex items-center gap-1.5 ${
                shape === s.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bevel Position for Optician */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-600">
          <Sliders className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-700">Kanal / Faset Pozisyonu:</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onChange('bevelPosition', 'one_third')}
            className={`px-2.5 py-1 rounded-md text-[11px] border ${
              bevelPosition === 'one_third'
                ? 'bg-emerald-600 text-white border-emerald-600 font-semibold'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            1/3 Kuralı (Standart Ön Kavis)
          </button>
          <button
            type="button"
            onClick={() => onChange('bevelPosition', 'front_flush')}
            className={`px-2.5 py-1 rounded-md text-[11px] border ${
              bevelPosition === 'front_flush'
                ? 'bg-emerald-600 text-white border-emerald-600 font-semibold'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Öne Sıfır (Tüm Taşma Arkaya)
          </button>
          <button
            type="button"
            onClick={() => onChange('bevelPosition', 'centered')}
            className={`px-2.5 py-1 rounded-md text-[11px] border ${
              bevelPosition === 'centered'
                ? 'bg-emerald-600 text-white border-emerald-600 font-semibold'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Ortalanmış
          </button>
        </div>
      </div>
    </div>
  );
};
