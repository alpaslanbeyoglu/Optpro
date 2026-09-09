import React, { useState } from 'react';
import { LensCalculationResult, FrameParameters, EyePrescription } from '../types';
import { Layers, Maximize2, ShieldAlert, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

interface Props {
  selectedResult: LensCalculationResult;
  comparisonResult?: LensCalculationResult; // Typically 1.50
  prescription: EyePrescription;
  frame: FrameParameters;
}

export const Lens2DCrossSection: React.FC<Props> = ({
  selectedResult,
  comparisonResult,
  prescription,
  frame,
}) => {
  const [showComparisonOverlay, setShowComparisonOverlay] = useState<boolean>(true);
  const [viewMeridian, setViewMeridian] = useState<'horizontal' | 'max_thickness'>('max_thickness');

  const { sph, cyl } = prescription;
  const isMinus = sph <= 0 && (sph + cyl) <= 0;

  // Frame parameters
  const lensWidthMm = frame.a;
  const rimThickMm = selectedResult.frameRimThickness;

  // Selected lens metrics
  const tc = selectedResult.centerThickness;
  const tMax = selectedResult.maxEdgeThickness;
  const tNasal = selectedResult.nasalEdgeThickness;
  const tTemporal = selectedResult.temporalEdgeThickness;

  // Baseline metrics if available
  const baseTc = comparisonResult?.centerThickness ?? tc;
  const baseTMax = comparisonResult?.maxEdgeThickness ?? tMax;
  const baseTNasal = comparisonResult?.nasalEdgeThickness ?? tNasal;
  const baseTTemporal = comparisonResult?.temporalEdgeThickness ?? tTemporal;

  // Effective edge thicknesses to display based on view meridian
  const edgeLeft = viewMeridian === 'max_thickness' ? tMax : tNasal;
  const edgeRight = viewMeridian === 'max_thickness' ? selectedResult.minEdgeThickness : tTemporal;
  const leftLabel = viewMeridian === 'max_thickness' ? 'Maksimum Kenar (En Kalın)' : 'Burun Kenarı (Nasal)';
  const rightLabel = viewMeridian === 'max_thickness' ? 'Minimum Kenar' : 'Şakak Kenarı (Temporal)';

  const baseEdgeLeft = viewMeridian === 'max_thickness' ? baseTMax : baseTNasal;
  const baseEdgeRight = viewMeridian === 'max_thickness' ? (comparisonResult?.minEdgeThickness ?? edgeRight) : baseTTemporal;

  // SVG coordinate system scaling
  // Width represents lensWidthMm (e.g. 52mm) mapped to ~520px
  const svgWidth = 620;
  const svgHeight = 280;
  const originX = svgWidth / 2;
  const originY = svgHeight / 2 - 10;
  const scaleMm = 7.5; // pixels per mm

  const halfWidthPx = (lensWidthMm / 2) * scaleMm;
  const leftX = originX - halfWidthPx;
  const rightX = originX + halfWidthPx;

  // Helper to build SVG path for a lens cross-section
  // Front surface is generally convex (base curve), rear surface is concave for minus or less convex for plus
  const generateLensPath = (centerT: number, leftT: number, rightT: number) => {
    const centerTPx = centerT * scaleMm;
    const leftTPx = leftT * scaleMm;
    const rightTPx = rightT * scaleMm;

    // Front surface arc (Anterior)
    // Moderate natural curvature
    const frontSagPx = 14; 
    const frontCenterY = originY - centerTPx / 2;
    const frontLeftY = originY - leftTPx / 2 + (isMinus ? 0 : frontSagPx * 0.4);
    const frontRightY = originY - rightTPx / 2 + (isMinus ? 0 : frontSagPx * 0.4);

    // Rear surface arc (Posterior)
    const rearCenterY = originY + centerTPx / 2;
    const rearLeftY = originY + leftTPx / 2;
    const rearRightY = originY + rightTPx / 2;

    return `
      M ${leftX} ${frontLeftY}
      Q ${originX} ${frontCenterY - (isMinus ? frontSagPx * 0.5 : frontSagPx)} ${rightX} ${frontRightY}
      L ${rightX} ${rearRightY}
      Q ${originX} ${rearCenterY + (isMinus ? frontSagPx * 0.9 : -frontSagPx * 0.3)} ${leftX} ${rearLeftY}
      Z
    `;
  };

  const selectedPath = generateLensPath(tc, edgeLeft, edgeRight);
  const baselinePath = comparisonResult ? generateLensPath(baseTc, baseEdgeLeft, baseEdgeRight) : '';

  // Frame rim visualization on left edge (thickest point)
  // Shows how lens sits in frame groove
  const rimThickPx = rimThickMm * scaleMm;
  const rimDepthPx = 28; // width of frame rim in cross section

  // Overhang calculation
  const overhang = Math.max(0, edgeLeft - rimThickMm);
  const isOverhanging = rimThickMm > 0 && overhang > 0.2;

  return (
    <div id="lens-2d-cross-section" className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
              <Layers className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900">
              2D Milimetrik Yan Kesit Profili
            </h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {selectedResult.material.shortName}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Optik merkez ve kenar kalınlıklarının gerçek ölçekli mikrometrik kesiti (1 mm = 7.5 px)
          </p>
        </div>

        {/* Meridian & overlay toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            id="btn-toggle-meridian"
            onClick={() => setViewMeridian(viewMeridian === 'max_thickness' ? 'horizontal' : 'max_thickness')}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
          >
            Kesit: {viewMeridian === 'max_thickness' ? 'En Kalın Meridyen' : 'Yatay (Burun-Şakak)'}
          </button>

          {comparisonResult && comparisonResult.material.id !== selectedResult.material.id && (
            <button
              type="button"
              id="btn-toggle-overlay"
              onClick={() => setShowComparisonOverlay(!showComparisonOverlay)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 ${
                showComparisonOverlay
                  ? 'bg-amber-50 border-amber-300 text-amber-900 font-semibold'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${showComparisonOverlay ? 'bg-amber-500' : 'bg-slate-300'}`} />
              1.50 ile Kıyaslama Katmanı
            </button>
          )}
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative my-4 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-xl overflow-hidden shadow-inner border border-slate-800 p-2">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(#94a3b8 1px, transparent 1px), radial-gradient(#94a3b8 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 10px 10px',
          }}
        />

        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto max-h-[300px] select-none"
        >
          <defs>
            {/* Glass gradient for selected lens */}
            <linearGradient id="selectedLensGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#818cf8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.45" />
            </linearGradient>

            {/* Baseline comparison ghost gradient */}
            <linearGradient id="baselineGhostGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0.15" />
            </linearGradient>

            {/* Frame rim gradient */}
            <linearGradient id="frameRimGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="50%" stopColor="#475569" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
          </defs>

          {/* Center line (Optical axis) */}
          <line
            x1={originX}
            y1={20}
            x2={originX}
            y2={svgHeight - 40}
            stroke="#475569"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <text
            x={originX + 6}
            y={32}
            fill="#94a3b8"
            fontSize="10"
            fontFamily="monospace"
          >
            Optik Merkez (OC)
          </text>

          {/* Baseline 1.50 Ghost Overlay if enabled */}
          {showComparisonOverlay && comparisonResult && comparisonResult.material.id !== selectedResult.material.id && (
            <g id="baseline-ghost-group">
              <path
                d={baselinePath}
                fill="url(#baselineGhostGrad)"
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity="0.8"
              />
              <text
                x={leftX - 8}
                y={originY - (baseEdgeLeft * scaleMm) / 2 - 8}
                fill="#f59e0b"
                fontSize="11"
                fontWeight="bold"
                textAnchor="end"
              >
                1.50 Standart: {baseEdgeLeft.toFixed(1)} mm
              </text>
            </g>
          )}

          {/* Selected Lens body */}
          <path
            d={selectedPath}
            fill="url(#selectedLensGrad)"
            stroke="#38bdf8"
            strokeWidth="2.2"
            filter="drop-shadow(0 0 10px rgba(56, 189, 248, 0.35))"
          />

          {/* Lens anti-reflective green/violet shimmer highlight */}
          <path
            d={`M ${leftX + 20} ${originY - 8} Q ${originX} ${originY - 14} ${rightX - 20} ${originY - 8}`}
            stroke="#4ade80"
            strokeWidth="1"
            strokeOpacity="0.6"
            fill="none"
          />

          {/* Frame Rim Bevel representation on left edge */}
          {rimThickMm > 0 && (
            <g id="frame-rim-cross-section">
              {/* Frame profile box holding the lens */}
              <rect
                x={leftX - rimDepthPx}
                y={originY - rimThickPx / 2}
                width={rimDepthPx}
                height={rimThickPx}
                fill="url(#frameRimGrad)"
                stroke="#64748b"
                strokeWidth="1"
                rx="3"
              />
              {/* Frame V-bevel notch */}
              <polygon
                points={`
                  ${leftX},${originY - 4}
                  ${leftX - 6},${originY}
                  ${leftX},${originY + 4}
                `}
                fill="#0f172a"
              />
              <text
                x={leftX - rimDepthPx / 2}
                y={originY + rimThickPx / 2 + 14}
                fill="#cbd5e1"
                fontSize="9.5"
                textAnchor="middle"
              >
                Çerçeve ({rimThickMm.toFixed(1)}mm)
              </text>
            </g>
          )}

          {/* Left Edge Dimension Marker */}
          <g id="marker-left-edge">
            <line
              x1={leftX - 6}
              y1={originY - (edgeLeft * scaleMm) / 2}
              x2={leftX - 6}
              y2={originY + (edgeLeft * scaleMm) / 2}
              stroke="#38bdf8"
              strokeWidth="2"
            />
            {/* Top and bottom tick */}
            <line x1={leftX - 12} y1={originY - (edgeLeft * scaleMm) / 2} x2={leftX} y2={originY - (edgeLeft * scaleMm) / 2} stroke="#38bdf8" strokeWidth="1.5" />
            <line x1={leftX - 12} y1={originY + (edgeLeft * scaleMm) / 2} x2={leftX} y2={originY + (edgeLeft * scaleMm) / 2} stroke="#38bdf8" strokeWidth="1.5" />
            <text
              x={leftX - (rimThickMm > 0 ? rimDepthPx + 16 : 14)}
              y={originY + 4}
              fill="#38bdf8"
              fontSize="13"
              fontWeight="bold"
              textAnchor="end"
              fontFamily="monospace"
            >
              {edgeLeft.toFixed(1)} mm
            </text>
            <text
              x={leftX - (rimThickMm > 0 ? rimDepthPx + 16 : 14)}
              y={originY + 18}
              fill="#94a3b8"
              fontSize="9"
              textAnchor="end"
            >
              {leftLabel}
            </text>
          </g>

          {/* Right Edge Dimension Marker */}
          <g id="marker-right-edge">
            <line
              x1={rightX + 6}
              y1={originY - (edgeRight * scaleMm) / 2}
              x2={rightX + 6}
              y2={originY + (edgeRight * scaleMm) / 2}
              stroke="#38bdf8"
              strokeWidth="2"
            />
            <line x1={rightX} y1={originY - (edgeRight * scaleMm) / 2} x2={rightX + 12} y2={originY - (edgeRight * scaleMm) / 2} stroke="#38bdf8" strokeWidth="1.5" />
            <line x1={rightX} y1={originY + (edgeRight * scaleMm) / 2} x2={rightX + 12} y2={originY + (edgeRight * scaleMm) / 2} stroke="#38bdf8" strokeWidth="1.5" />
            <text
              x={rightX + 16}
              y={originY + 4}
              fill="#38bdf8"
              fontSize="13"
              fontWeight="bold"
              fontFamily="monospace"
            >
              {edgeRight.toFixed(1)} mm
            </text>
            <text
              x={rightX + 16}
              y={originY + 18}
              fill="#94a3b8"
              fontSize="9"
            >
              {rightLabel}
            </text>
          </g>

          {/* Center Thickness Marker */}
          <g id="marker-center-thickness">
            <line
              x1={originX + 12}
              y1={originY - (tc * scaleMm) / 2}
              x2={originX + 12}
              y2={originY + (tc * scaleMm) / 2}
              stroke="#a855f7"
              strokeWidth="2"
            />
            <line x1={originX + 6} y1={originY - (tc * scaleMm) / 2} x2={originX + 18} y2={originY - (tc * scaleMm) / 2} stroke="#a855f7" strokeWidth="1.5" />
            <line x1={originX + 6} y1={originY + (tc * scaleMm) / 2} x2={originX + 18} y2={originY + (tc * scaleMm) / 2} stroke="#a855f7" strokeWidth="1.5" />
            <text
              x={originX + 22}
              y={originY + 4}
              fill="#c084fc"
              fontSize="12"
              fontWeight="bold"
              fontFamily="monospace"
            >
              CT: {tc.toFixed(1)} mm
            </text>
            <text
              x={originX + 22}
              y={originY + 16}
              fill="#94a3b8"
              fontSize="8.5"
            >
              Merkez Kalınlığı
            </text>
          </g>

          {/* Bottom Millimeter Scale Bar */}
          <g id="mm-scale-bar" transform={`translate(${leftX}, ${svgHeight - 24})`}>
            <line x1={0} y1={0} x2={halfWidthPx * 2} y2={0} stroke="#475569" strokeWidth="1" />
            {/* 10mm ticks */}
            {Array.from({ length: Math.floor(lensWidthMm / 10) + 1 }).map((_, idx) => {
              const xPos = idx * 10 * scaleMm;
              return (
                <g key={`tick-${idx}`}>
                  <line x1={xPos} y1={-5} x2={xPos} y2={5} stroke="#64748b" strokeWidth="1" />
                  <text x={xPos} y={15} fill="#64748b" fontSize="9" textAnchor="middle" fontFamily="monospace">
                    {idx * 10}
                  </text>
                </g>
              );
            })}
            <text x={halfWidthPx * 2 + 10} y={4} fill="#64748b" fontSize="9" fontFamily="monospace">
              mm (Ekartman: {lensWidthMm}mm)
            </text>
          </g>
        </svg>

        {/* Overhang Callout Badge in SVG container */}
        {isOverhanging && (
          <div className="absolute top-3 left-3 bg-amber-500/20 backdrop-blur-md border border-amber-500/40 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 text-amber-300 text-xs">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              Çerçeveden <strong>+{overhang.toFixed(1)} mm</strong> taşma yapıyor
            </span>
          </div>
        )}
        {!isOverhanging && rimThickMm > 0 && (
          <div className="absolute top-3 left-3 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/40 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 text-emerald-300 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Çerçeve içine tam oturuyor (Taşma yok)</span>
          </div>
        )}
      </div>

      {/* Numerical metric summary pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
          <span className="text-slate-500 text-[11px]">En Kalın Kenar</span>
          <span className="text-slate-900 font-bold text-sm font-mono mt-0.5">{tMax.toFixed(2)} mm</span>
          {comparisonResult && selectedResult.thicknessReductionPercent > 0 && (
            <span className="text-emerald-600 font-semibold text-[11px] mt-0.5">
              %{selectedResult.thicknessReductionPercent} daha ince
            </span>
          )}
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
          <span className="text-slate-500 text-[11px]">Merkez Kalınlığı (CT)</span>
          <span className="text-slate-900 font-bold text-sm font-mono mt-0.5">{tc.toFixed(2)} mm</span>
          <span className="text-slate-500 text-[11px] mt-0.5">Optik merkez noktası</span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
          <span className="text-slate-500 text-[11px]">Tahmini Cam Ağırlığı</span>
          <span className="text-slate-900 font-bold text-sm font-mono mt-0.5">{selectedResult.weightGrams} gr</span>
          {comparisonResult && selectedResult.weightReductionPercent > 0 && (
            <span className="text-blue-600 font-semibold text-[11px] mt-0.5">
              %{selectedResult.weightReductionPercent} daha hafif
            </span>
          )}
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
          <span className="text-slate-500 text-[11px]">Çerçeve Taşması</span>
          <span className={`font-bold text-sm font-mono mt-0.5 ${isOverhanging ? 'text-amber-600' : 'text-emerald-600'}`}>
            {isOverhanging ? `+${overhang.toFixed(1)} mm` : 'Sıfır / Gizli'}
          </span>
          <span className="text-slate-500 text-[11px] mt-0.5">
            {frame.frameType === 'acetate' ? 'Kemik Çerçeve' : frame.frameType === 'metal' ? 'Metal Çerçeve' : frame.frameType === 'semi_rimless' ? 'Nilör' : 'Faset'}
          </span>
        </div>
      </div>
    </div>
  );
};
