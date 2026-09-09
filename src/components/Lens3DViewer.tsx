import React, { useRef, useEffect, useState } from 'react';
import { LensCalculationResult, EyePrescription, FrameParameters } from '../types';
import { Rotate3d, Compass, Eye, Sparkles, RefreshCw, ZoomIn, ZoomOut, Flame } from 'lucide-react';

interface Props {
  selectedResult: LensCalculationResult;
  prescription: EyePrescription;
  frame: FrameParameters;
}

export const Lens3DViewer: React.FC<Props> = ({
  selectedResult,
  prescription,
  frame,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rotationX, setRotationX] = useState<number>(22); // degrees pitch
  const [rotationY, setRotationY] = useState<number>(38); // degrees yaw
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [lastMousePos, setLastMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'realistic' | 'heatmap'>('realistic');
  const [showAxisMarker, setShowAxisMarker] = useState<boolean>(true);
  const [zoom, setZoom] = useState<number>(1.0);

  const { sph, cyl, axis } = prescription;
  const isMinus = sph <= 0 && (sph + cyl) <= 0;

  // Touch and mouse handlers for 3D rotation
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setAutoRotate(false);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;

    setRotationY((prev) => (prev + deltaX * 0.75) % 360);
    setRotationX((prev) => Math.max(-60, Math.min(60, prev - deltaY * 0.75)));
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setAutoRotate(false);
      setLastMousePos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - lastMousePos.x;
    const deltaY = e.touches[0].clientY - lastMousePos.y;

    setRotationY((prev) => (prev + deltaX * 0.75) % 360);
    setRotationX((prev) => Math.max(-60, Math.min(60, prev - deltaY * 0.75)));
    setLastMousePos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Auto-rotation animation loop
  useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => {
      setRotationY((prev) => (prev + 0.6) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, [autoRotate]);

  // Main Canvas Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI scaling
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    // Coordinate system
    const centerX = width / 2;
    const centerY = height / 2;
    const rotXRad = (rotationX * Math.PI) / 180;
    const rotYRad = (rotationY * Math.PI) / 180;

    // Base visual radius in pixels
    const baseRadiusPx = Math.min(width, height) * 0.28 * zoom;
    const thicknessScale = 5.5 * zoom; // scale factor for visual thickness in 3D

    // 3D projection function (isometric/perspective)
    const project3D = (x: number, y: number, z: number) => {
      // Rotate around Y axis (yaw)
      const x1 = x * Math.cos(rotYRad) + z * Math.sin(rotYRad);
      const z1 = -x * Math.sin(rotYRad) + z * Math.cos(rotYRad);

      // Rotate around X axis (pitch)
      const y2 = y * Math.cos(rotXRad) - z1 * Math.sin(rotXRad);
      const z2 = y * Math.sin(rotXRad) + z1 * Math.cos(rotXRad);

      // Perspective scale factor
      const distance = 400;
      const perspective = distance / (distance - z2);

      return {
        x: centerX + x1 * perspective,
        y: centerY + y2 * perspective,
        z: z2,
        scale: perspective,
      };
    };

    // Extract perimeter points
    const points = selectedResult.perimeterPoints;
    const numPoints = points.length;

    // Prepare front and back 3D vertices for each perimeter point
    interface Vertex3D {
      x: number;
      y: number;
      zFront: number;
      zBack: number;
      thickness: number;
      angleDeg: number;
    }

    const vertices: Vertex3D[] = [];
    const maxT = selectedResult.maxEdgeThickness;
    const minT = selectedResult.minEdgeThickness;

    for (let i = 0; i < numPoints; i++) {
      const pt = points[i];
      const rad = (pt.angleDeg * Math.PI) / 180;
      
      // Normalized coordinates along frame contour
      // In screen coordinates: Top is -Y, Bottom is +Y
      const pxX = (pt.xMm / (frame.a / 2)) * baseRadiusPx;
      const pxY = -(pt.yMm / (frame.b / 2)) * baseRadiusPx * (frame.b / frame.a);

      // Z coordinates for front and back surfaces
      const edgeThicknessPx = pt.thicknessMm * thicknessScale;
      // Anterior (front) surface has a curved dome, flattened by surface technology (Aspheric, Bi-AS, Zeiss ClearView)
      const flatnessMultiplier = Math.max(0.4, 1 - (selectedResult.flatnessBonusPercent || 0) / 100);
      const domeSag = (1 - (pt.radiusMm / (frame.a / 2))) * 12 * (isMinus ? 0.3 : 1.2) * flatnessMultiplier;

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

    // Build side panels (quads between vertex i and vertex i+1)
    interface QuadFace {
      p1Front: { x: number; y: number; z: number };
      p2Front: { x: number; y: number; z: number };
      p2Back: { x: number; y: number; z: number };
      p1Back: { x: number; y: number; z: number };
      avgZ: number;
      normalZ: number;
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

      // Calculate normal vector of quad to determine lighting and backface culling
      const vec1X = p2F.x - p1F.x;
      const vec1Y = p2F.y - p1F.y;
      const vec2X = p1B.x - p1F.x;
      const vec2Y = p1B.y - p1F.y;
      const crossZ = vec1X * vec2Y - vec1Y * vec2X;

      quads.push({
        p1Front: p1F,
        p2Front: p2F,
        p2Back: p2B,
        p1Back: p1B,
        avgZ,
        normalZ: crossZ,
        thickness: (v1.thickness + v2.thickness) / 2,
        angleDeg: v1.angleDeg,
      });
    }

    // Depth sort quads (Painter's algorithm: draw from back z to front z)
    quads.sort((a, b) => a.avgZ - b.avgZ);

    // Draw Back Surface of the lens
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < numPoints; i++) {
      const v = vertices[i];
      const proj = project3D(v.x, v.y, v.zBack);
      if (i === 0) ctx.moveTo(proj.x, proj.y);
      else ctx.lineTo(proj.x, proj.y);
    }
    ctx.closePath();
    ctx.fillStyle = viewMode === 'heatmap' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(186, 230, 253, 0.2)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // Color helper for Heatmap
    const getHeatmapColor = (t: number) => {
      // Map thickness between 1.0mm (green) to 3.0mm (yellow) to 6.0mm+ (red)
      const range = Math.max(0.5, maxT - minT);
      const factor = Math.min(1, Math.max(0, (t - minT) / range));

      if (factor < 0.5) {
        // Green to Yellow
        const r = Math.round(34 + factor * 2 * (234 - 34));
        const g = Math.round(197 + factor * 2 * (179 - 197));
        const b = Math.round(94 - factor * 2 * 94);
        return `rgba(${r}, ${g}, ${b}, 0.85)`;
      } else {
        // Yellow to Red
        const f = (factor - 0.5) * 2;
        const r = Math.round(234 + f * (239 - 234));
        const g = Math.round(179 - f * 111);
        const b = Math.round(8 - f * 8);
        return `rgba(${r}, ${g}, ${b}, 0.9)`;
      }
    };

    // Draw Lens Side Rim (Bevel Edge Thickness)
    quads.forEach((quad) => {
      ctx.beginPath();
      ctx.moveTo(quad.p1Front.x, quad.p1Front.y);
      ctx.lineTo(quad.p2Front.x, quad.p2Front.y);
      ctx.lineTo(quad.p2Back.x, quad.p2Back.y);
      ctx.lineTo(quad.p1Back.x, quad.p1Back.y);
      ctx.closePath();

      if (viewMode === 'heatmap') {
        ctx.fillStyle = getHeatmapColor(quad.thickness);
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.2)';
        ctx.lineWidth = 0.5;
        ctx.fill();
        ctx.stroke();
      } else {
        // Realistic Glass Shading with specular highlight based on angle
        const lightAngle = (rotationY * Math.PI) / 180;
        const quadAngleRad = (quad.angleDeg * Math.PI) / 180;
        const dot = Math.abs(Math.cos(quadAngleRad - lightAngle));
        const alpha = 0.35 + dot * 0.45;

        // Gradient on edge bevel
        const grad = ctx.createLinearGradient(
          quad.p1Front.x,
          quad.p1Front.y,
          quad.p1Back.x,
          quad.p1Back.y
        );
        grad.addColorStop(0, `rgba(186, 230, 253, ${alpha * 0.8})`);
        grad.addColorStop(0.5, `rgba(56, 189, 248, ${alpha})`);
        grad.addColorStop(1, `rgba(14, 165, 233, ${alpha * 0.9})`);

        ctx.fillStyle = grad;
        ctx.strokeStyle = `rgba(125, 211, 252, ${0.4 + dot * 0.5})`;
        ctx.lineWidth = 1;
        ctx.fill();
        ctx.stroke();
      }
    });

    // Draw Front Surface of the lens
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
      ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
    } else {
      // Glass specular sheen
      const sheenGrad = ctx.createRadialGradient(
        centerX - baseRadiusPx * 0.3,
        centerY - baseRadiusPx * 0.3,
        baseRadiusPx * 0.1,
        centerX,
        centerY,
        baseRadiusPx * 1.1
      );
      sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      sheenGrad.addColorStop(0.35, 'rgba(224, 242, 254, 0.25)');
      sheenGrad.addColorStop(0.85, 'rgba(56, 189, 248, 0.15)');
      sheenGrad.addColorStop(1, 'rgba(30, 58, 138, 0.2)');
      ctx.fillStyle = sheenGrad;
    }
    ctx.fill();
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.85)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // Draw Optical Center Marker (OC) on front surface
    // Nasal decentration towards bridge
    const ocDecentrationX = ((frame.a + frame.dbl) / 2 - prescription.pdMono);
    const ocPxX = -(ocDecentrationX / (frame.a / 2)) * baseRadiusPx;

    // Pupil Height (H) is strictly measured from the BOTTOM of the frame box upwards:
    // Bottom rim is at y = -b/2 (in physical) => +canvasY
    // Distance from bottom rim = prescription.height
    // Vertical coordinate from centerline = prescription.height - frame.b / 2
    // In screen coordinates (up is -Y):
    const ocDecentrationY = prescription.height - frame.b / 2;
    const ocPxY = -(ocDecentrationY / (frame.b / 2)) * baseRadiusPx * (frame.b / frame.a);

    const ocProj = project3D(ocPxX, ocPxY, -selectedResult.centerThickness * thicknessScale * 0.5);

    // Bottom rim point directly below the optical center (for height ruler from bottom)
    const bottomRimPxY = baseRadiusPx * (frame.b / frame.a);
    const bottomRimProj = project3D(ocPxX, bottomRimPxY, -selectedResult.centerThickness * thicknessScale * 0.4);

    // Draw Height Measurement Guide from BOTTOM RIM upwards to Pupil
    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([3, 3]);
    ctx.moveTo(bottomRimProj.x, bottomRimProj.y);
    ctx.lineTo(ocProj.x, ocProj.y);
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Bottom rim base mark (showing measurement starts at bottom)
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(bottomRimProj.x - 10, bottomRimProj.y);
    ctx.lineTo(bottomRimProj.x + 10, bottomRimProj.y);
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Height measurement tag text
    ctx.fillStyle = '#f43f5e';
    ctx.font = 'bold 10px JetBrains Mono, monospace';
    const midY = (bottomRimProj.y + ocProj.y) / 2;
    ctx.fillText(`H: ${prescription.height} mm`, ocProj.x + 12, midY + 3);
    ctx.restore();

    // Draw Pupil / Optical Center (Red dot + Crosshair)
    ctx.save();
    ctx.beginPath();
    ctx.arc(ocProj.x, ocProj.y, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = '#f43f5e';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // OC crosshair
    ctx.beginPath();
    ctx.moveTo(ocProj.x - 8, ocProj.y);
    ctx.lineTo(ocProj.x + 8, ocProj.y);
    ctx.moveTo(ocProj.x, ocProj.y - 8);
    ctx.lineTo(ocProj.x, ocProj.y + 8);
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();

    // Draw Cylinder Axis Marker Line if Astigmatism exists and toggle enabled
    if (Math.abs(cyl) > 0.1 && showAxisMarker) {
      const axisRad = (axis * Math.PI) / 180;
      const axisLen = baseRadiusPx * 0.85;
      const ax1X = ocPxX + Math.cos(axisRad) * axisLen;
      const ax1Y = ocPxY + Math.sin(axisRad) * axisLen;
      const ax2X = ocPxX - Math.cos(axisRad) * axisLen;
      const ax2Y = ocPxY - Math.sin(axisRad) * axisLen;

      const pAx1 = project3D(ax1X, ax1Y, -selectedResult.centerThickness * thicknessScale * 0.5);
      const pAx2 = project3D(ax2X, ax2Y, -selectedResult.centerThickness * thicknessScale * 0.5);

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
  }, [rotationX, rotationY, selectedResult, frame, prescription, viewMode, showAxisMarker, zoom]);

  const resetView = () => {
    setRotationX(22);
    setRotationY(38);
    setZoom(1.0);
    setAutoRotate(true);
  };

  return (
    <div id="lens-3d-viewer" className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
              <Rotate3d className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900">
              3D İnteraktif Cam İnceleme (360°)
            </h3>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
              Döndürülebilir Model
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Farenizle veya dokunarak camı çevirebilir, astigmat aksına bağlı kenar kalınlık dalgalanmasını inceleyebilirsiniz.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            id="btn-viewmode-toggle"
            onClick={() => setViewMode(viewMode === 'realistic' ? 'heatmap' : 'realistic')}
            className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 ${
              viewMode === 'heatmap'
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            {viewMode === 'heatmap' ? 'Isı Haritası Aktif' : 'Kalınlık Haritası'}
          </button>

          <button
            type="button"
            id="btn-autorotate-toggle"
            onClick={() => setAutoRotate(!autoRotate)}
            className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-colors ${
              autoRotate
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {autoRotate ? 'Dönüşü Durdur' : 'Otomatik Döndür'}
          </button>

          <button
            type="button"
            id="btn-reset-3d"
            onClick={resetView}
            title="Açıyı Sıfırla"
            className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3D Canvas Box */}
      <div className="relative my-3 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 rounded-xl overflow-hidden border border-slate-800 shadow-inner h-[280px]">
        {/* Subtle radial ambient glow */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent" />

        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="w-full h-full cursor-grab active:cursor-grabbing select-none touch-none"
        />

        {/* Legend overlays */}
        <div className="absolute bottom-3 left-3 flex flex-col gap-1 text-[11px] text-slate-300 bg-slate-900/85 backdrop-blur-md px-2.5 py-2 rounded-lg border border-slate-800 shadow-md">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
            <span className="font-semibold text-white">
              Pupil / Optik Merkez: <span className="text-rose-400 font-mono">H = {prescription.height} mm</span>
            </span>
          </div>
          <div className="text-[10px] text-slate-400 pl-4">
            (Şablonun en alt kenarından yukarıya doğru ölçülmüştür)
          </div>
          {Math.abs(cyl) > 0.1 && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-3 h-0.5 bg-amber-400 border-dashed" />
              <span>Astigmat Aksı: {axis}°</span>
            </div>
          )}
          {viewMode === 'heatmap' && (
            <div className="flex items-center gap-2 mt-1 pt-1 border-t border-slate-800">
              <span className="text-[10px] text-slate-400">İnce ({selectedResult.minEdgeThickness}mm)</span>
              <div className="w-16 h-1.5 rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500" />
              <span className="text-[10px] text-slate-400">Kalın ({selectedResult.maxEdgeThickness}mm)</span>
            </div>
          )}
        </div>

        {/* Surface Tech Flatness badge (Top-left) */}
        {selectedResult.flatnessBonusPercent > 0 && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 text-[11px] font-bold text-sky-200 bg-blue-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-sky-600/40">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>%{selectedResult.flatnessBonusPercent} Daha Düz Cam Profili ({selectedResult.clearVisionFieldMultiplier}x Görüş Alanı)</span>
          </div>
        )}

        {/* Zoom controls */}
        <div className="absolute top-3 right-3 flex flex-col gap-1 bg-slate-900/80 backdrop-blur-md p-1 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
            className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800"
            title="Yakınlaştır"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.7, z - 0.1))}
            className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800"
            title="Uzaklaştır"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Footer tips */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <span className="italic">
          {Math.abs(cyl) > 0
            ? `Astigmat (${cyl.toFixed(2)} D @ ${axis}°) nedeniyle kenar kalınlığı açıyla değişir.`
            : 'Sferik diyoptri simetrisi; kenarlar eşit dağılımlıdır.'}
        </span>
        <span className="font-mono text-slate-700 font-medium">
          Açı: {Math.round(rotationY)}°
        </span>
      </div>
    </div>
  );
};
