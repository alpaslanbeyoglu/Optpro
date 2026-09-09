import React, { useRef } from 'react';
import { EyePrescription, FrameParameters, LensCalculationResult } from '../types';
import { Printer, X, Glasses, Check, ShieldCheck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  notes: string;
  prescriptionOD: EyePrescription;
  prescriptionOS: EyePrescription;
  frame: FrameParameters;
  resultsOD: LensCalculationResult[];
  resultsOS: LensCalculationResult[];
  selectedMaterialId: string;
}

export const PrintReportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  patientName,
  notes,
  prescriptionOD,
  prescriptionOS,
  frame,
  resultsOD,
  resultsOS,
  selectedMaterialId,
}) => {
  const printAreaRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const selectedMaterialOD = resultsOD.find((r) => r.material.id === selectedMaterialId) || resultsOD[0];

  return (
    <div id="print-report-modal" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col my-auto">
        {/* Modal Top Bar (Hidden on print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Müşteri Teklif & Bilgi Formu Önizleme
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Yazdır / PDF Olarak Kaydet</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div ref={printAreaRef} className="p-8 sm:p-10 space-y-6 text-slate-900 bg-white" id="printable-content">
          {/* Document Header */}
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <Glasses className="w-7 h-7 text-blue-600" />
                <h1 className="text-xl font-black tracking-tight text-slate-900">
                  OPTİK MAĞAZASI
                </h1>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Gözlük Camı Kalınlığı & Kırılma İndeksi Danışmanlık Formu
              </p>
            </div>
            <div className="text-right text-xs">
              <div className="font-bold text-slate-900">{currentDate}</div>
              <div className="text-slate-500">Form No: #{Math.floor(100000 + Math.random() * 900000)}</div>
            </div>
          </div>

          {/* Customer & Prescription Info Box */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 block text-[11px]">Müşteri Adı / Sayın:</span>
              <span className="font-bold text-sm text-slate-900">
                {patientName || 'Misafir Müşteri'}
              </span>
              {notes && <p className="text-slate-600 mt-1 italic">Not: {notes}</p>}
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Seçilen Çerçeve Bilgileri:</span>
              <span className="font-bold text-slate-900">
                {frame.a}□{frame.dbl} ({frame.b}mm) -{' '}
                {frame.frameType === 'acetate'
                  ? 'Kemik/Asetat Çerçeve'
                  : frame.frameType === 'metal'
                  ? 'İnce Metal Çerçeve'
                  : frame.frameType === 'semi_rimless'
                  ? 'Nilör (Yarı Çerçeve)'
                  : 'Faset (Çerçevesiz)'}
              </span>
            </div>
          </div>

          {/* Prescription Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Reçete Değerleri
            </h4>
            <table className="w-full text-xs text-left border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold">
                  <th className="border border-slate-200 p-2">Göz</th>
                  <th className="border border-slate-200 p-2 text-center">SPH (Sferik)</th>
                  <th className="border border-slate-200 p-2 text-center">CYL (Silindirik)</th>
                  <th className="border border-slate-200 p-2 text-center">AKS (Axis)</th>
                  <th className="border border-slate-200 p-2 text-center">PD (Pupilla)</th>
                  <th className="border border-slate-200 p-2 text-center">Yükseklik (H - Alt Kenardan)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-200 p-2 font-bold text-slate-900">Sağ Göz (OD)</td>
                  <td className="border border-slate-200 p-2 text-center font-mono font-bold">
                    {prescriptionOD.sph > 0 ? `+${prescriptionOD.sph.toFixed(2)}` : prescriptionOD.sph.toFixed(2)}
                  </td>
                  <td className="border border-slate-200 p-2 text-center font-mono">
                    {prescriptionOD.cyl !== 0 ? prescriptionOD.cyl.toFixed(2) : '-'}
                  </td>
                  <td className="border border-slate-200 p-2 text-center font-mono">
                    {prescriptionOD.cyl !== 0 ? `${prescriptionOD.axis}°` : '-'}
                  </td>
                  <td className="border border-slate-200 p-2 text-center font-mono">{prescriptionOD.pdMono} mm</td>
                  <td className="border border-slate-200 p-2 text-center font-mono">{prescriptionOD.height} mm</td>
                </tr>
                <tr>
                  <td className="border border-slate-200 p-2 font-bold text-slate-900">Sol Göz (OS)</td>
                  <td className="border border-slate-200 p-2 text-center font-mono font-bold">
                    {prescriptionOS.sph > 0 ? `+${prescriptionOS.sph.toFixed(2)}` : prescriptionOS.sph.toFixed(2)}
                  </td>
                  <td className="border border-slate-200 p-2 text-center font-mono">
                    {prescriptionOS.cyl !== 0 ? prescriptionOS.cyl.toFixed(2) : '-'}
                  </td>
                  <td className="border border-slate-200 p-2 text-center font-mono">
                    {prescriptionOS.cyl !== 0 ? `${prescriptionOS.axis}°` : '-'}
                  </td>
                  <td className="border border-slate-200 p-2 text-center font-mono">{prescriptionOS.pdMono} mm</td>
                  <td className="border border-slate-200 p-2 text-center font-mono">{prescriptionOS.height} mm</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Lens Thickness Comparison Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Cam Kalınlığı ve İnceltme Karşılaştırması (Sağ Göz Referanslı)
            </h4>
            <table className="w-full text-xs text-left border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold">
                  <th className="border border-slate-200 p-2">Kırılma İndeksi</th>
                  <th className="border border-slate-200 p-2 text-center">Kenar Kalınlığı</th>
                  <th className="border border-slate-200 p-2 text-center">Merkez Kalınlığı</th>
                  <th className="border border-slate-200 p-2 text-center">Ağırlık</th>
                  <th className="border border-slate-200 p-2 text-center">İnceltme %</th>
                  <th className="border border-slate-200 p-2 text-center">Değerlendirme</th>
                </tr>
              </thead>
              <tbody>
                {resultsOD.slice(0, 5).map((res) => {
                  const isSelected = res.material.id === selectedMaterialId;
                  return (
                    <tr
                      key={res.material.id}
                      className={isSelected ? 'bg-blue-50/80 font-semibold border-2 border-blue-600' : ''}
                    >
                      <td className="border border-slate-200 p-2">
                        <span className="font-mono font-bold text-slate-900">{res.material.id}</span>{' '}
                        <span className="text-slate-600">({res.material.shortName})</span>
                        {isSelected && (
                          <span className="ml-1.5 text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded-sm">
                            Seçilen
                          </span>
                        )}
                      </td>
                      <td className="border border-slate-200 p-2 text-center font-mono font-bold text-slate-900">
                        {res.maxEdgeThickness.toFixed(2)} mm
                      </td>
                      <td className="border border-slate-200 p-2 text-center font-mono">
                        {res.centerThickness.toFixed(2)} mm
                      </td>
                      <td className="border border-slate-200 p-2 text-center font-mono">
                        {res.weightGrams} gr
                      </td>
                      <td className="border border-slate-200 p-2 text-center font-mono text-emerald-700 font-bold">
                        {res.thicknessReductionPercent > 0 ? `%${res.thicknessReductionPercent}` : 'Baz'}
                      </td>
                      <td className="border border-slate-200 p-2 text-center text-[11px]">
                        {res.suitabilityScore === 'optimal'
                          ? 'En İdeal Seçim'
                          : res.suitabilityScore === 'recommended'
                          ? 'Tavsiye Edilen'
                          : res.suitabilityScore === 'too_thick'
                          ? 'Çok Kalın Kalır'
                          : res.suitabilityScore === 'unsuitable'
                          ? 'Montaja Uygun Değil'
                          : 'Standart'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Recommendation Box */}
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs">
            <h5 className="font-bold text-blue-900 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span>Optisyen Tavsiyesi: {selectedMaterialOD.material.name}</span>
            </h5>
            <p className="text-blue-800 leading-relaxed">
              {selectedMaterialOD.recommendationReason} Seçtiğiniz cam{' '}
              <strong>%{selectedMaterialOD.thicknessReductionPercent} daha ince</strong> ve{' '}
              <strong>{selectedMaterialOD.weightGrams} gram</strong> ağırlığında üretilecektir. UV400 tam
              koruması ve antirefle kaplama ile birlikte teslim edilecektir.
            </p>
          </div>

          {/* Signatures Footer */}
          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block">Optisyen Kaşe & İmza:</span>
              <div className="h-14 border-b border-dashed border-slate-300 mt-2" />
            </div>
            <div>
              <span className="text-slate-400 block">Müşteri Onayı:</span>
              <div className="h-14 border-b border-dashed border-slate-300 mt-2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
