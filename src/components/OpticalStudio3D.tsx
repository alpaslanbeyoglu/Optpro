import React, { useRef, useEffect, useState } from 'react';
import {
  LensCalculationResult,
  EyePrescription,
  FrameParameters,
  SurfaceTechnology,
  EyeType,
} from '../types';
import {
  Rotate3d,
  Sparkles,
  Flame,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Split,
  Eye,
  Sliders,
  Glasses,
  Play,
  Pause,
  ShieldCheck,
  Maximize2,
  Info,
  Check,
} from 'lucide-react';
import { SURFACE_TECHNOLOGIES, LENS_MATERIALS } from '../utils/opticsCalculations';

interface Props {
  selectedResult: LensCalculationResult;
  baselineResult: LensCalculationResult;
  prescription: EyePrescription;
  frame: FrameParameters;
  activeEye: EyeType;
  selectedMaterialId: string;
  onSelectMaterialId: (id: string) => void;
  surfaceTech: SurfaceTechnology;
  onSelectSurfaceTech: (tech: SurfaceTechnology) => void;
  onOpenPresentation: () => void;
  onOpenPrint: () => void;
}

export type CameraPreset = 'free' | 'side' | 'front' | 'top' | 'isometric';

export const OpticalStudio3D: React.FC<Props> = ({
  selectedResult,
  baselineResult,
  prescription,
  frame,
  activeEye,
  selectedMaterialId,
  onSelectMaterialId,
  surfaceTech,
  onSelectSurfaceTech,
  onOpenPresentation,
  onOpenPrint,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 3D Viewport states
  const [rotationX, setRotationX] = useState<number>(20);
  const [rotationY, setRotationY] = useState<number>(35);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [lastMousePos, setLastMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [dualView, setDualView] = useState<boolean>(false); // 1.50 vs Selected side-by-side
  const [viewMode, setViewMode] = useState<'realistic' | 'heatmap'>('realistic');
  const [showRuler, setShowRuler] = useState<boolean>(true);
  const [showAxis, setShowAxis] = useState<boolean>(true);
  const [showFrameBevel, setShowFrameBevel] = useState<boolean>(true);
  const [zoom, setZoom] = useState<number>(1.05);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('free');

  const { sph, cyl, axis } = prescription;
  const isMinus = sph <= 0 && sph + cyl <= 0;

  // Camera presets
  const applyCameraPreset = (preset: CameraPreset) => {
    setCameraPreset(preset);
    setAutoRotate(false);
    switch (preset) {
      case 'side':
        // Pure side profile
        setRotationX(0);
        setRotationY(90);
        break;
      case 'front':
        // Frontal view
        setRotationX(0);
        setRotationY(0);
        break;
      case 'top':
        // Top-down view
        setRotationX(85);
        setRotationY(0);
        break;
      case 'isometric':
        // 45 degree isometric perspective
        setRotationX(25);
        setRotationY(45);
        break;
      case 'free':
      default:
        setRotationX(20);
        setRotationY(35);
        setAutoRotate(true);
        break;
    }
  };

  // Mouse & Touch interactions
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setAutoRotate(false);
    setCameraPreset('free');
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;

    setRotationY((prev) => (prev + deltaX * 0.7) % 360);
    setRotationX((prev) => Math.max(-75, Math.min(75, prev - deltaY * 0.7)));
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setAutoRotate(false);
      setCameraPreset('free');
      setLastMousePos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - lastMousePos.x;
    const deltaY = e.touches[0].clientY - lastMousePos.y;

    setRotationY((prev) => (prev + deltaX * 0.7) % 360);
    setRotationX((prev) => Math.max(-75, Math.min(75, prev - deltaY * 0.7)));
    setLastMousePos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Auto rotation loop
  useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => {
      setRotationY((prev) => (prev + 0.5) % 360);
    }, 28);
    return () => clearInterval(interval);
  }, [autoRotate]);

  // Main 3D Canvas Renderer (Handles Single or Dual view)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    // Subtle dark studio radial background
    const bgGrad = ctx.createRadialGradient(
      width / 2,
      height / 2,
      50,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.75
    );
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(0.6, '#090d16');
    bgGrad.addColorStop(1, '#030712');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Background optical grid lines for depth
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();

    const rotXRad = (rotationX * Math.PI) / 180;
    const rotYRad = (rotationY * Math.PI) / 180;

    // Helper: Draw a single 3D lens model at a given center offset
    const renderLens3D = (
      result: LensCalculationResult,
      centerX: number,
      centerY: number,
      scaleFactor: number,
      title: string,
      badgeText: string,
      badgeColor: string
    ) => {
      const baseRadiusPx = Math.min(width, height) * 0.22 * zoom * scaleFactor;
      const thicknessScale = 6.2 * zoom * scaleFactor;

      const project3D = (x: number, y: number, z: number) => {
        const x1 = x * Math.cos(rotYRad) + z * Math.sin(rotYRad);
        const z1 = -x * Math.sin(rotYRad) + z * Math.cos(rotYRad);

        const y2 = y * Math.cos(rotXRad) - z1 * Math.sin(rotXRad);
        const z2 = y * Math.sin(rotXRad) + z1 * Math.cos(rotXRad);

        const distance = 460;
        const perspective = distance / (distance - z2);

        return {
          x: centerX + x1 * perspective,
          y: centerY + y2 * perspective,
          z: z2,
          scale: perspective,
        };
      };

      const points = result.perimeterPoints;
      const numPoints = points.length;

      // 3D Vertices
      interface Vertex3D {
        x: number;
        y: number;
        zFront: number;
        zBack: number;
        thickness: number;
        angleDeg: number;
      }

      const vertices: Vertex3D[] = [];
      const maxT = result.maxEdgeThickness;
      const minT = result.minEdgeThickness;

      for (let i = 0; i < numPoints; i++) {
        const pt = points[i];
        const pxX = (pt.xMm / (frame.a / 2)) * baseRadiusPx;
        // Screen Y: up is -Y, down is +Y
        const pxY = -(pt.yMm / (frame.b / 2)) * baseRadiusPx * (frame.b / frame.a);

        const edgeThicknessPx = pt.thicknessMm * thicknessScale;
        // Aspheric / Bi-AS / Zeiss ClearView flatness factor:
        const flatnessMultiplier = Math.max(0.38, 1 - (result.flatnessBonusPercent || 0) / 100);
        const domeSag = (1 - pt.radiusMm / (frame.a / 2)) * 14 * (isMinus ? 0.3 : 1.2) * flatnessMultiplier;

        const zFront = -edgeThicknessPx / 2 - domeSag;
        const zBack = edgeThicknessPx / 2;

        vertices.push({
          x: pxX,
          y: pxY,
          zFront,
          zBack,
          thickness: pt.thicknessMm,
          angleDeg: pt.angleDeg,
        });
      }

      // Draw 3D Frame Rim Bevel if enabled
      if (showFrameBevel && frame.frameType !== 'rimless') {
        const rimOffsetPx = (result.frameRimThickness || 3.0) * 1.8 * zoom * scaleFactor;
        ctx.save();
        ctx.beginPath();
        for (let i = 0; i < numPoints; i++) {
          const v = vertices[i];
          const rad = (v.angleDeg * Math.PI) / 180;
          const rX = v.x + Math.cos(rad) * rimOffsetPx;
          const rY = v.y - Math.sin(rad) * rimOffsetPx;
          const p = project3D(rX, rY, 0);
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.closePath();
        ctx.strokeStyle = frame.frameType === 'acetate' ? 'rgba(71, 85, 105, 0.55)' : 'rgba(148, 163, 184, 0.45)';
        ctx.lineWidth = frame.frameType === 'acetate' ? 4 : 2;
        ctx.stroke();
        ctx.restore();
      }

      // Quads on side rim (edge)
      interface QuadFace {
        p1Front: { x: number; y: number; z: number };
        p2Front: { x: number; y: number; z: number };
        p2Back: { x: number; y: number; z: number };
        p1Back: { x: number; y: number; z: number };
        avgZ: number;
        thickness: number;
        angleDeg: number;
      }

      const quads: QuadFace[] = [];
      for (let i = 0; i < numPoints; i++) {
        const v1 = vertices[i];
        const v2 = vertices[(i + 1) % numPoints];

        const p1F = project3D(v1.x, v1.y, v1.zFront);
        const p2F = project3D(v2.x, v2.y, v2.zFront);
        const p2B = project3D(v2.x, v2.y, v2.zBack);
        const p1B = project3D(v1.x, v1.y, v1.zBack);

        const avgZ = (p1F.z + p2F.z + p2B.z + p1B.z) / 4;

        quads.push({
          p1Front: p1F,
          p2Front: p2F,
          p2Back: p2B,
          p1Back: p1B,
          avgZ,
          thickness: (v1.thickness + v2.thickness) / 2,
          angleDeg: v1.angleDeg,
        });
      }

      // Painter's algorithm depth sort
      quads.sort((a, b) => a.avgZ - b.avgZ);

      // Back surface of lens
      ctx.save();
      ctx.beginPath();
      for (let i = 0; i < numPoints; i++) {
        const v = vertices[i];
        const proj = project3D(v.x, v.y, v.zBack);
        if (i === 0) ctx.moveTo(proj.x, proj.y);
        else ctx.lineTo(proj.x, proj.y);
      }
      ctx.closePath();
      ctx.fillStyle = viewMode === 'heatmap' ? 'rgba(30, 41, 59, 0.8)' : 'rgba(186, 230, 253, 0.12)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // Heatmap helper
      const getHeatmapColor = (t: number) => {
        const range = Math.max(0.5, maxT - minT);
        const factor = Math.min(1, Math.max(0, (t - minT) / range));
        if (factor < 0.5) {
          const r = Math.round(34 + factor * 2 * (234 - 34));
          const g = Math.round(197 + factor * 2 * (179 - 197));
          const b = Math.round(94 - factor * 2 * 94);
          return `rgba(${r}, ${g}, ${b}, 0.88)`;
        } else {
          const f = (factor - 0.5) * 2;
          const r = Math.round(234 + f * (239 - 234));
          const g = Math.round(179 - f * 111);
          const b = Math.round(8 - f * 8);
          return `rgba(${r}, ${g}, ${b}, 0.92)`;
        }
      };

      // Draw Side Quads (Edge Thickness Bevel)
      quads.forEach((quad) => {
        ctx.beginPath();
        ctx.moveTo(quad.p1Front.x, quad.p1Front.y);
        ctx.lineTo(quad.p2Front.x, quad.p2Front.y);
        ctx.lineTo(quad.p2Back.x, quad.p2Back.y);
        ctx.lineTo(quad.p1Back.x, quad.p1Back.y);
        ctx.closePath();

        if (viewMode === 'heatmap') {
          ctx.fillStyle = getHeatmapColor(quad.thickness);
          ctx.strokeStyle = 'rgba(15, 23, 42, 0.3)';
          ctx.lineWidth = 0.5;
          ctx.fill();
          ctx.stroke();
        } else {
          const lightAngle = (rotationY * Math.PI) / 180;
          const quadAngleRad = (quad.angleDeg * Math.PI) / 180;
          const dot = Math.abs(Math.cos(quadAngleRad - lightAngle));
          const alpha = 0.4 + dot * 0.45;

          const grad = ctx.createLinearGradient(
            quad.p1Front.x,
            quad.p1Front.y,
            quad.p1Back.x,
            quad.p1Back.y
          );
          grad.addColorStop(0, `rgba(224, 242, 254, ${alpha * 0.9})`);
          grad.addColorStop(0.5, `rgba(56, 189, 248, ${alpha})`);
          grad.addColorStop(1, `rgba(14, 165, 233, ${alpha * 0.95})`);

          ctx.fillStyle = grad;
          ctx.strokeStyle = `rgba(186, 230, 253, ${0.45 + dot * 0.5})`;
          ctx.lineWidth = 1;
          ctx.fill();
          ctx.stroke();
        }
      });

      // Front Surface of lens
      ctx.save();
      ctx.beginPath();
      for (let i = 0; i < numPoints; i++) {
        const v = vertices[i];
        const proj = project3D(v.x, v.y, v.zFront);
        if (i === 0) ctx.moveTo(proj.x, proj.y);
        else ctx.lineTo(proj.x, proj.y);
      }
      ctx.closePath();

      if (viewMode === 'heatmap') {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
      } else {
        // High-end antireflective coating sheen (greenish-blue AR shimmer)
        const sheenGrad = ctx.createRadialGradient(
          centerX - baseRadiusPx * 0.35,
          centerY - baseRadiusPx * 0.35,
          baseRadiusPx * 0.1,
          centerX,
          centerY,
          baseRadiusPx * 1.15
        );
        sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
        sheenGrad.addColorStop(0.3, 'rgba(224, 242, 254, 0.3)');
        sheenGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.18)');
        sheenGrad.addColorStop(0.9, 'rgba(16, 185, 129, 0.15)'); // AR green tint
        sheenGrad.addColorStop(1, 'rgba(30, 58, 138, 0.25)');
        ctx.fillStyle = sheenGrad;
      }
      ctx.fill();
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.9)';
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.restore();

      // Optical Center & Pupil Height Ruler (Measured from BOTTOM of rim)
      const ocDecentrationX = (frame.a + frame.dbl) / 2 - prescription.pdMono;
      const ocPxX = -(ocDecentrationX / (frame.a / 2)) * baseRadiusPx;

      // H is measured from BOTTOM rim upwards:
      const ocDecentrationY = prescription.height - frame.b / 2;
      const ocPxY = -(ocDecentrationY / (frame.b / 2)) * baseRadiusPx * (frame.b / frame.a);

      const ocProj = project3D(ocPxX, ocPxY, -result.centerThickness * thicknessScale * 0.5);

      // Bottom rim baseline point
      const bottomRimPxY = baseRadiusPx * (frame.b / frame.a);
      const bottomRimProj = project3D(ocPxX, bottomRimPxY, -result.centerThickness * thicknessScale * 0.4);

      if (showRuler) {
        ctx.save();
        // Dashed height measurement line from bottom rim
        ctx.beginPath();
        ctx.setLineDash([3, 3]);
        ctx.moveTo(bottomRimProj.x, bottomRimProj.y);
        ctx.lineTo(ocProj.x, ocProj.y);
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Bottom rim base mark (showing reference origin)
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(bottomRimProj.x - 12, bottomRimProj.y);
        ctx.lineTo(bottomRimProj.x + 12, bottomRimProj.y);
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Height tag
        ctx.fillStyle = '#f43f5e';
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        const midY = (bottomRimProj.y + ocProj.y) / 2;
        ctx.fillText(`H: ${prescription.height} mm (Tabandan)`, ocProj.x + 10, midY + 4);
        ctx.restore();
      }

      // Pupil point & crosshair
      ctx.save();
      ctx.beginPath();
      ctx.arc(ocProj.x, ocProj.y, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#f43f5e';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(ocProj.x - 7, ocProj.y);
      ctx.lineTo(ocProj.x + 7, ocProj.y);
      ctx.moveTo(ocProj.x, ocProj.y - 7);
      ctx.lineTo(ocProj.x, ocProj.y + 7);
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();

      // Astigmatism Axis Line
      if (Math.abs(cyl) > 0.1 && showAxis) {
        const axisRad = (axis * Math.PI) / 180;
        const axisLen = baseRadiusPx * 0.85;
        const ax1X = ocPxX + Math.cos(axisRad) * axisLen;
        const ax1Y = ocPxY + Math.sin(axisRad) * axisLen;
        const ax2X = ocPxX - Math.cos(axisRad) * axisLen;
        const ax2Y = ocPxY - Math.sin(axisRad) * axisLen;

        const pAx1 = project3D(ax1X, ax1Y, -result.centerThickness * thicknessScale * 0.5);
        const pAx2 = project3D(ax2X, ax2Y, -result.centerThickness * thicknessScale * 0.5);

        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([4, 4]);
        ctx.moveTo(pAx1.x, pAx1.y);
        ctx.lineTo(pAx2.x, pAx2.y);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }

      // Title & Telemetry Header on the lens viewport
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px Plus Jakarta Sans, sans-serif';
      ctx.fillText(title, centerX - 80, centerY - baseRadiusPx - 40);

      // Badge
      ctx.fillStyle = badgeColor;
      ctx.font = 'bold 11px JetBrains Mono, monospace';
      ctx.fillText(badgeText, centerX - 80, centerY - baseRadiusPx - 22);

      // Max thickness tag at top
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px JetBrains Mono, monospace';
      ctx.fillText(`Kenar: ${result.maxEdgeThickness.toFixed(2)} mm  |  Merkez: ${result.centerThickness.toFixed(2)} mm`, centerX - 80, centerY + baseRadiusPx + 40);
      ctx.restore();
    };

    // Render either Dual View (1.50 vs Selected) or Single View
    if (dualView) {
      // Left: 1.50 Standard Baseline
      renderLens3D(
        baselineResult,
        width * 0.28,
        height * 0.52,
        0.82,
        '1.50 Standart Organik Cam',
        'Geleneksel Sferik Kavis',
        '#94a3b8'
      );

      // Right: Selected Index + Surface Tech
      const techName = SURFACE_TECHNOLOGIES.find((t) => t.id === surfaceTech)?.shortName || 'Asiferik';
      renderLens3D(
        selectedResult,
        width * 0.72,
        height * 0.52,
        0.82,
        `${selectedResult.material.name} (${techName})`,
        `%${selectedResult.thicknessReductionPercent} İnce  •  %${selectedResult.flatnessBonusPercent || 0} Daha Düz`,
        '#38bdf8'
      );

      // Center dividing line for split mode
      ctx.save();
      ctx.beginPath();
      ctx.setLineDash([4, 6]);
      ctx.moveTo(width / 2, 40);
      ctx.lineTo(width / 2, height - 40);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    } else {
      // Single Master 3D View
      const techName = SURFACE_TECHNOLOGIES.find((t) => t.id === surfaceTech)?.name || 'Asiferik';
      renderLens3D(
        selectedResult,
        width * 0.5,
        height * 0.52,
        1.0,
        `${selectedResult.material.name} — ${techName}`,
        `%${selectedResult.thicknessReductionPercent} İnce  •  ${selectedResult.clearVisionFieldMultiplier}x Görüş Alanı`,
        '#38bdf8'
      );
    }
  }, [
    rotationX,
    rotationY,
    selectedResult,
    baselineResult,
    frame,
    prescription,
    dualView,
    viewMode,
    showRuler,
    showAxis,
    showFrameBevel,
    zoom,
    surfaceTech,
  ]);

  return (
    <div id="optical-studio-3d" className="relative w-full rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 flex flex-col">
      {/* 3D Viewport Top Command Bar */}
      <div className="z-20 flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-blue-600/30 text-sky-400 border border-blue-500/30">
            <Rotate3d className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-white tracking-tight">
                3D OPTİK CAM SİMÜLATÖRÜ
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-sky-300 border border-blue-500/30">
                360° Real-Time
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Gözlük camı kenar kalınlığını, bombeliğini ve çerçeve uyumunu 3 boyutlu inceleyin
            </p>
          </div>
        </div>

        {/* View Mode & Presentation Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Dual 3D Split Comparison Toggle */}
          <button
            type="button"
            id="btn-dual-3d-toggle"
            onClick={() => setDualView(!dualView)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              dualView
                ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
          >
            <Split className="w-4 h-4" />
            <span>{dualView ? 'Tekli 3D Görünüm' : '1.50 vs İkili Kıyaslama (Dual 3D)'}</span>
          </button>

          {/* Customer presentation modal button */}
          <button
            type="button"
            onClick={onOpenPresentation}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Müşteri Sunumu</span>
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Viewport */}
      <div className="relative w-full h-[520px] sm:h-[580px] lg:h-[640px] cursor-grab active:cursor-grabbing select-none overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="w-full h-full block"
        />

        {/* Top-Right Camera Angle Selector Dock */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5 bg-slate-900/85 backdrop-blur-md p-2 rounded-2xl border border-slate-800 shadow-lg text-xs">
          <span className="text-[10px] font-bold text-slate-400 px-2 py-0.5 uppercase tracking-wider">
            Kamera Açısı
          </span>

          <div className="grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => applyCameraPreset('side')}
              className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 ${
                cameraPreset === 'side'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
              title="Kenar kalınlığını tam profilden inceleyin"
            >
              <span>📐 Yan Profil</span>
            </button>

            <button
              type="button"
              onClick={() => applyCameraPreset('front')}
              className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 ${
                cameraPreset === 'front'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
              title="Pupil ve optik merkezi inceleyin"
            >
              <span>👁️ Ön Bakış</span>
            </button>

            <button
              type="button"
              onClick={() => applyCameraPreset('top')}
              className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 ${
                cameraPreset === 'top'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
              title="Şakak ve burun kenarı kalınlık farkını üstten inceleyin"
            >
              <span>🔝 Üstten</span>
            </button>

            <button
              type="button"
              onClick={() => applyCameraPreset('isometric')}
              className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 ${
                cameraPreset === 'isometric'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>📐 45° Kavis</span>
            </button>
          </div>

          <div className="pt-1.5 mt-1 border-t border-slate-800 flex items-center justify-between gap-1">
            <button
              type="button"
              onClick={() => setAutoRotate(!autoRotate)}
              className={`p-1.5 rounded-lg text-xs font-medium flex-1 flex items-center justify-center gap-1 ${
                autoRotate ? 'bg-sky-500/20 text-sky-300' : 'text-slate-400 hover:bg-slate-800'
              }`}
              title="360 Otomatik Döndür"
            >
              {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span className="text-[10px]">{autoRotate ? 'Durdur' : 'Döndür'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRotationX(20);
                setRotationY(35);
                setZoom(1.05);
                setAutoRotate(true);
                setCameraPreset('free');
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
              title="Sıfırla"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Top-Left Visual Layers / Overlays Dock */}
        <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-1.5 bg-slate-900/85 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 shadow-lg text-xs">
          {/* Heatmap toggle */}
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'realistic' ? 'heatmap' : 'realistic')}
            className={`px-2.5 py-1.5 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1.5 ${
              viewMode === 'heatmap'
                ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{viewMode === 'heatmap' ? 'Isı Haritası (Aktif)' : 'Isı Haritası'}</span>
          </button>

          {/* Pupil Height Ruler Toggle */}
          <button
            type="button"
            onClick={() => setShowRuler(!showRuler)}
            className={`px-2.5 py-1.5 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1.5 ${
              showRuler
                ? 'bg-rose-600/30 text-rose-300 border border-rose-500/40'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <span>📏 Yükseklik (Alt Kenardan)</span>
          </button>

          {/* Frame Bevel Rim Toggle */}
          <button
            type="button"
            onClick={() => setShowFrameBevel(!showFrameBevel)}
            className={`px-2.5 py-1.5 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1.5 ${
              showFrameBevel
                ? 'bg-blue-600/30 text-sky-300 border border-blue-500/40'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Glasses className="w-3.5 h-3.5" />
            <span>Çerçeve Yuvası</span>
          </button>

          {/* Astigmatism Axis toggle */}
          {Math.abs(cyl) > 0.1 && (
            <button
              type="button"
              onClick={() => setShowAxis(!showAxis)}
              className={`px-2.5 py-1.5 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1.5 ${
                showAxis
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <span>Aks: {axis}°</span>
            </button>
          )}

          {/* Zoom controls */}
          <div className="flex items-center gap-1 pl-1 border-l border-slate-800">
            <button
              type="button"
              onClick={() => setZoom((prev) => Math.min(1.8, prev + 0.15))}
              className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800"
              title="Yakınlaştır"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoom((prev) => Math.max(0.6, prev - 0.15))}
              className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800"
              title="Uzaklaştır"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bottom Floating Live Telemetry HUD */}
        <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-slate-800 shadow-xl">
          {/* Key Metrics Chips */}
          <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Max Kenar Kalınlığı
              </span>
              <div className="text-lg sm:text-xl font-black text-white font-mono flex items-baseline gap-1">
                <span>{selectedResult.maxEdgeThickness.toFixed(2)}</span>
                <span className="text-xs text-slate-400 font-sans">mm</span>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-800 hidden sm:block" />

            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Merkez Kalınlığı
              </span>
              <div className="text-lg sm:text-xl font-black text-slate-200 font-mono flex items-baseline gap-1">
                <span>{selectedResult.centerThickness.toFixed(2)}</span>
                <span className="text-xs text-slate-400 font-sans">mm</span>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-800 hidden sm:block" />

            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Ağırlık
              </span>
              <div className="text-lg sm:text-xl font-black text-slate-200 font-mono flex items-baseline gap-1">
                <span>{selectedResult.weightGrams}</span>
                <span className="text-xs text-slate-400 font-sans">gr</span>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-800 hidden sm:block" />

            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Standarta Göre
              </span>
              <div className="text-lg sm:text-xl font-black text-emerald-400 font-mono">
                {selectedResult.thicknessReductionPercent > 0
                  ? `-%${selectedResult.thicknessReductionPercent} İnce`
                  : 'Standart'}
              </div>
            </div>

            <div className="h-8 w-px bg-slate-800 hidden lg:block" />

            {/* Overhang status */}
            <div className="hidden lg:block">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Çerçeveden Taşma
              </span>
              <div className="text-xs font-bold text-slate-300 mt-1">
                {selectedResult.maxEdgeThickness <= selectedResult.frameRimThickness ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Çerçeve İçine Gizlenir (0 mm Taşma)
                  </span>
                ) : (
                  <span className="text-amber-400">
                    +{(selectedResult.maxEdgeThickness - selectedResult.frameRimThickness).toFixed(1)} mm Arkadan Taşar
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Pupil Height notice from bottom rim */}
          <div className="text-[11px] text-slate-400 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
            <span>
              Pupil Yüksekliği: <strong className="text-white font-mono">H = {prescription.height} mm</strong> (Çerçevenin en alt kenarından)
            </span>
          </div>
        </div>
      </div>

      {/* Directly Docked 3D Controller: Quick Refractive Index & Surface Tech Shelves */}
      <div className="bg-slate-900 border-t border-slate-800 p-4 sm:p-5 space-y-4">
        {/* Row 1: Quick Refractive Index Selector */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>1. Kırılma İndeksi Seçimi</span>
              <span className="text-[10px] font-normal text-slate-400">(İndeks yükseldikçe 3D model anında incelir)</span>
            </span>
            <span className="text-xs font-mono font-bold text-sky-400">
              {selectedResult.material.name} ({selectedResult.material.index})
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {LENS_MATERIALS.slice(0, 5).map((mat) => {
              const isSelected = mat.id === selectedMaterialId;
              return (
                <button
                  key={mat.id}
                  type="button"
                  onClick={() => onSelectMaterialId(mat.id)}
                  className={`p-2.5 rounded-xl text-left border-2 transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-500 bg-blue-600/20 text-white shadow-md'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm">{mat.id}</span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-sky-400 shadow-xs" />
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                    {mat.shortName}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-mono font-bold mt-1">
                    {mat.id === '1.50' ? 'Standart' : mat.reductionLabel}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: Quick Surface Technology Selector (Spheric, Aspheric, Bi-Aspheric, ZEISS ClearView) */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>2. Yüzey Tasarımı & Optik Teknoloji</span>
              <span className="text-[10px] font-normal text-slate-400">(Cam kavisini düzleştirir ve net görüş alanını genişletir)</span>
            </span>
            <span className="text-xs font-bold text-sky-400">
              {SURFACE_TECHNOLOGIES.find((t) => t.id === surfaceTech)?.name}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {SURFACE_TECHNOLOGIES.map((tech) => {
              const isSelected = tech.id === surfaceTech;
              const isZeiss = tech.id === 'zeiss_clearview';
              return (
                <button
                  key={tech.id}
                  type="button"
                  onClick={() => onSelectSurfaceTech(tech.id)}
                  className={`p-2.5 rounded-xl text-left border-2 transition-all flex flex-col justify-between ${
                    isSelected
                      ? isZeiss
                        ? 'border-blue-500 bg-gradient-to-r from-blue-900/50 to-indigo-900/40 text-white shadow-md'
                        : 'border-blue-500 bg-blue-600/20 text-white shadow-md'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs">{tech.shortName}</span>
                    <span className="text-[10px] font-mono text-sky-300 bg-slate-800/80 px-1.5 py-0.2 rounded-sm">
                      {tech.clearVisionFieldMultiplier}x Görüş
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                    {tech.aberrationReduction}
                  </div>
                  <div className="text-[10px] font-mono text-emerald-400 mt-1">
                    {tech.flatnessBonusPercent > 0 ? `%${tech.flatnessBonusPercent} Daha Düz Profil` : 'Geleneksel Kavis'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
