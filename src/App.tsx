import React, { useState, useMemo } from 'react';
import {
  EyePrescription,
  EyeType,
  FrameParameters,
  PrescriptionPreset,
  SurfaceTechnology,
} from './types';
import { calculateAllIndices, LENS_MATERIALS } from './utils/opticsCalculations';
import { Navbar } from './components/Navbar';
import { OpticalStudio3D } from './components/OpticalStudio3D';
import { PrescriptionInput } from './components/PrescriptionInput';
import { FrameSelector } from './components/FrameSelector';
import { IndexComparisonCards } from './components/IndexComparisonCards';
import { SurfaceTechComparison } from './components/SurfaceTechComparison';
import { Lens2DCrossSection } from './components/Lens2DCrossSection';
import { OverhangVisualizer } from './components/OverhangVisualizer';
import { CustomerPresentationModal } from './components/CustomerPresentationModal';
import { PrintReportModal } from './components/PrintReportModal';
import {
  Sparkles,
  Presentation,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Printer,
  Layers,
  BarChart3,
  Sliders,
} from 'lucide-react';

export default function App() {
  // Prescription state
  const [activeEye, setActiveEye] = useState<EyeType>('OD');
  const [patientName, setPatientName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [od, setOd] = useState<EyePrescription>({
    sph: -4.00,
    cyl: -1.25,
    axis: 180,
    pdMono: 31,
    height: 21,
  });

  const [os, setOs] = useState<EyePrescription>({
    sph: -3.75,
    cyl: -1.00,
    axis: 175,
    pdMono: 31,
    height: 21,
  });

  // Frame parameters
  const [frame, setFrame] = useState<FrameParameters>({
    a: 52,
    b: 40,
    dbl: 18,
    frameType: 'acetate',
    shape: 'rectangular',
    bevelPosition: 'one_third',
  });

  // Selected lens material ID for focused inspection (defaults to 1.67)
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('1.67');

  // Surface Technology state (spheric, aspheric, bi-aspheric, zeiss_clearview)
  const [surfaceTech, setSurfaceTech] = useState<SurfaceTechnology>('aspheric');

  // Modal states
  const [isPresentationOpen, setIsPresentationOpen] = useState<boolean>(false);
  const [isPrintOpen, setIsPrintOpen] = useState<boolean>(false);

  // Active eye prescription
  const activePrescription = activeEye === 'OD' ? od : os;

  // Handlers for prescription changes
  const handlePrescriptionChange = (field: keyof EyePrescription, value: number) => {
    if (activeEye === 'OD') {
      setOd((prev) => ({ ...prev, [field]: value }));
    } else {
      setOs((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleFrameChange = (field: keyof FrameParameters, value: any) => {
    setFrame((prev) => ({ ...prev, [field]: value }));
  };

  const handleCopyODtoOS = () => {
    setOs({ ...od });
  };

  const handlePresetSelect = (preset: PrescriptionPreset) => {
    if (activeEye === 'OD') {
      setOd((prev) => ({
        ...prev,
        sph: preset.sph,
        cyl: preset.cyl,
        axis: preset.axis,
      }));
    } else {
      setOs((prev) => ({
        ...prev,
        sph: preset.sph,
        cyl: preset.cyl,
        axis: preset.axis,
      }));
    }
  };

  const handleReset = () => {
    setOd({ sph: -3.00, cyl: 0.00, axis: 180, pdMono: 31, height: 20 });
    setOs({ sph: -3.00, cyl: 0.00, axis: 180, pdMono: 31, height: 20 });
    setPatientName('');
    setNotes('');
    setSelectedMaterialId('1.61');
    setSurfaceTech('aspheric');
  };

  // Run optical calculations for both eyes including surface technology
  const resultsOD = useMemo(() => calculateAllIndices(od, frame, surfaceTech), [od, frame, surfaceTech]);
  const resultsOS = useMemo(() => calculateAllIndices(os, frame, surfaceTech), [os, frame, surfaceTech]);

  const activeResults = activeEye === 'OD' ? resultsOD : resultsOS;

  const baselineResult = useMemo(
    () => activeResults.find((r) => r.material.id === '1.50') || activeResults[0],
    [activeResults]
  );

  const selectedResult = useMemo(
    () => activeResults.find((r) => r.material.id === selectedMaterialId) || activeResults[0],
    [activeResults, selectedMaterialId]
  );

  const selectedMaterial = useMemo(
    () => LENS_MATERIALS.find((m) => m.id === selectedMaterialId) || LENS_MATERIALS[3],
    [selectedMaterialId]
  );

  const [activeTab, setActiveTab] = useState<'2d' | 'matrix' | 'advice'>('2d');

  return (
    <div className="min-h-screen bg-slate-900/95 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeEye={activeEye}
        onEyeChange={setActiveEye}
        onOpenPresentation={() => setIsPresentationOpen(true)}
        onOpenPrint={() => setIsPrintOpen(true)}
        onReset={handleReset}
        patientName={patientName}
      />

      {/* Main App Container - Centered around 3D Studio */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-5 space-y-6">
        {/* CENTERPIECE 1: 3D OPTICAL STUDIO (HERO) */}
        <OpticalStudio3D
          selectedResult={selectedResult}
          baselineResult={baselineResult}
          prescription={activePrescription}
          frame={frame}
          activeEye={activeEye}
          selectedMaterialId={selectedMaterialId}
          onSelectMaterialId={setSelectedMaterialId}
          surfaceTech={surfaceTech}
          onSelectSurfaceTech={setSurfaceTech}
          onOpenPresentation={() => setIsPresentationOpen(true)}
          onOpenPrint={() => setIsPrintOpen(true)}
        />

        {/* SECTION 2: LIVE PRESCRIPTION & FRAME CONTROLS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <PrescriptionInput
              activeEye={activeEye}
              prescription={activePrescription}
              patientName={patientName}
              notes={notes}
              onEyeChange={setActiveEye}
              onPrescriptionChange={handlePrescriptionChange}
              onCopyODtoOS={handleCopyODtoOS}
              onPresetSelect={handlePresetSelect}
              onPatientNameChange={setPatientName}
              onNotesChange={setNotes}
              onReset={handleReset}
            />
          </div>

          <div className="lg:col-span-5">
            <FrameSelector frame={frame} onChange={handleFrameChange} />
          </div>
        </div>

        {/* SECTION 3: TABBED DEEP DIVE MODULES */}
        <div className="bg-slate-950/60 rounded-3xl p-4 sm:p-6 border border-slate-800 shadow-xl space-y-6">
          {/* Tab Navigation Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-600/20 text-sky-400 border border-blue-500/20">
                <Layers className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-white">
                  Teknik Analiz ve Karşılaştırma Raporu
                </h3>
                <p className="text-xs text-slate-400">
                  3D modelin yanı sıra milimetrik kesitleri, çerçeve yuva taşmalarını ve tüm indeks matrisini inceleyin.
                </p>
              </div>
            </div>

            {/* Tab Pills */}
            <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('2d')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === '2d'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-850'
                }`}
              >
                <span>📐 2D Kesit & Taşma</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('matrix')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'matrix'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-850'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>📊 İndeks & Teknoloji Matrisi</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('advice')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'advice'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-850'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>💡 Satış Argümanı</span>
              </button>
            </div>
          </div>

          {/* Tab Content: 2D Cross Section & Overhang */}
          {activeTab === '2d' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Lens2DCrossSection
                  selectedResult={selectedResult}
                  comparisonResult={baselineResult}
                  prescription={activePrescription}
                  frame={frame}
                />

                <OverhangVisualizer
                  selectedResult={selectedResult}
                  baselineResult={baselineResult}
                  frame={frame}
                />
              </div>
            </div>
          )}

          {/* Tab Content: All Index Cards & Surface Tech Matrix */}
          {activeTab === 'matrix' && (
            <div className="space-y-6">
              <IndexComparisonCards
                results={activeResults}
                selectedId={selectedMaterialId}
                onSelect={setSelectedMaterialId}
              />

              <SurfaceTechComparison
                prescription={activePrescription}
                frame={frame}
                selectedMaterial={selectedMaterial}
                activeSurfaceTech={surfaceTech}
                onSelectSurfaceTech={setSurfaceTech}
              />
            </div>
          )}

          {/* Tab Content: Optician Recommendations & Arguments */}
          {activeTab === 'advice' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 text-white space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                  <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <ShieldCheck className="w-5 h-5" />
                  </span>
                  <div>
                    <h4 className="text-base font-bold text-white">
                      Optisyen Satış Tavsiyesi
                    </h4>
                    <span className="text-xs text-emerald-400">
                      Önerilen Seçim: {selectedResult.material.name} ({surfaceTech === 'zeiss_clearview' ? 'ZEISS ClearView' : surfaceTech === 'biaspheric' ? 'Bi-Asiferik' : 'Asiferik'})
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-950/60 border border-blue-800/40 text-xs text-sky-200 leading-relaxed">
                  {selectedResult.recommendationReason}
                </div>

                <div className="space-y-3 text-xs text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">%{selectedResult.thicknessReductionPercent} Kalınlık Tasarrufu:</strong> Standart 1.50
                      cama kıyasla kenar kalınlığı {baselineResult.maxEdgeThickness.toFixed(1)} mm'den {selectedResult.maxEdgeThickness.toFixed(1)} mm'ye düşer.
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">%{selectedResult.weightReductionPercent} Ağırlık Tasarrufu:</strong> Burun kemiğinde iz yapmaz, gün boyu hafiflik sağlar.
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">Estetik & Doğal Göz Boyutu:</strong> Asiferik ve ZEISS FreeForm yüzey teknolojisi, miyop camlardaki göz küçültme ve hipermetroptaki büyütme etkisini ortadan kaldırır.
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Presentation Launcher Card */}
              <div className="bg-gradient-to-br from-blue-950/80 via-slate-900 to-slate-950 rounded-2xl p-6 border border-blue-900/40 flex flex-col justify-between text-white">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-sky-300 text-xs font-semibold mb-3 border border-blue-500/30">
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    <span>Müşteri İkna Modülü</span>
                  </div>
                  <h4 className="text-xl font-black text-white tracking-tight">
                    Müşterinize Özel Teklif ve Karşılaştırma Sunumu
                  </h4>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    Müşteri sunum ekranında standart cam ile inceltilmiş cam arasındaki farkı tek bakışta gösterin veya optisyen kaşeli teklif fişi çıktısı alın.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsPresentationOpen(true)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <Presentation className="w-4 h-4" />
                    <span>Müşteri Sunumunu Aç</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPrintOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4 text-sky-300" />
                    <span>Teklif Fişi</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 mt-12 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            <span className="font-bold text-slate-800">Optik Cam Kalınlığı Simülatörü</span> — Optisyenlik & Gözlük Mağazası Danışmanlık Sistemi
          </div>
          <div>
            Standart Ophthalmic Sagitta & Meridyen Güç Formülleri baz alınmıştır.
          </div>
        </div>
      </footer>

      {/* Customer Presentation Modal */}
      <CustomerPresentationModal
        isOpen={isPresentationOpen}
        onClose={() => setIsPresentationOpen(false)}
        selectedResult={selectedResult}
        baselineResult={baselineResult}
        prescription={activePrescription}
        frame={frame}
        patientName={patientName}
        onOpenPrintModal={() => {
          setIsPresentationOpen(false);
          setIsPrintOpen(true);
        }}
      />

      {/* Print Report Modal */}
      <PrintReportModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        patientName={patientName}
        notes={notes}
        prescriptionOD={od}
        prescriptionOS={os}
        frame={frame}
        resultsOD={resultsOD}
        resultsOS={resultsOS}
        selectedMaterialId={selectedMaterialId}
      />
    </div>
  );
}
