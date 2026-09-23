import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
  PreviewMode,
  ProcessedResult,
} from '../types';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Eye,
  Terminal,
  Grid,
  SplitSquareHorizontal,
} from 'lucide-react';

interface DigitPreviewProps {
  result: ProcessedResult | null;
  sourceImage: HTMLImageElement | null;
  isProcessing: boolean;
}

export const DigitPreview: React.FC<DigitPreviewProps> = ({
  result,
  sourceImage,
  isProcessing,
}) => {
  const [mode, setMode] = useState<PreviewMode>('color-digits');
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [splitPos, setSplitPos] = useState<number>(50); // percentage 0 - 100
  const [hoveredCell, setHoveredCell] = useState<{
    x: number;
    y: number;
    digit: string;
    index: number;
    colorName: string;
    hex: string;
    rgb: [number, number, number];
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Render pixel canvas when in 'pixels' or 'split-compare' mode
  useEffect(() => {
    if (!result || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = result.width;
    canvas.height = result.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgData = ctx.createImageData(result.width, result.height);
    const data = imgData.data;

    for (let y = 0; y < result.height; y++) {
      for (let x = 0; x < result.width; x++) {
        const idx = (y * result.width + x) * 4;
        const color = result.pixelColors[y][x];
        data[idx] = color.r;
        data[idx + 1] = color.g;
        data[idx + 2] = color.b;
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }, [result]);

  // Reset pan and auto-fit zoom when dimensions change
  useEffect(() => {
    if (result && containerRef.current) {
      const containerW = containerRef.current.clientWidth || 600;
      const containerH = containerRef.current.clientHeight || 500;
      // Calculate fit zoom based on character grid or pixel size
      const approxCharW = 9; // px per character
      const targetGridW = result.width * approxCharW;
      const targetGridH = result.height * (approxCharW * 1.5);
      const fitZoom = Math.min(
        (containerW - 60) / Math.max(1, targetGridW),
        (containerH - 80) / Math.max(1, targetGridH),
        2.5
      );
      setZoom(Math.max(0.6, Math.min(fitZoom, 1.8)));
      setPan({ x: 0, y: 0 });
    }
  }, [result?.width, result?.height]);

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 0.85;
    setZoom(prev => Math.max(0.2, Math.min(6.0, prev * factor)));
  };

  // Mouse drag pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      // Left click
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Plain text representation for raw mode
  const rawTextContent = useMemo(() => {
    if (!result) return '';
    return result.digits.map(row => row.join('')).join('\n');
  }, [result]);

  if (!result) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-neutral-500 bg-neutral-950/40">
        <Grid className="w-12 h-12 mb-3 text-neutral-700 stroke-[1.5]" />
        <h3 className="text-sm font-semibold text-neutral-300">No Image Processed</h3>
        <p className="text-xs text-neutral-500 max-w-sm mt-1">
          Upload an image, capture via webcam, or click a preset thumbnail on the left to generate the 3-bit dithered digits.
        </p>
      </div>
    );
  }

  const { width, height, paletteIndices, digits, palette } = result;

  return (
    <div className="flex-1 flex flex-col h-full bg-neutral-950 overflow-hidden relative">
      {/* Top Controls Bar */}
      <div className="h-12 px-4 border-b border-neutral-800/80 bg-neutral-900/60 backdrop-blur-md flex items-center justify-between shrink-0 z-10">
        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1 p-0.5 bg-neutral-950 rounded-lg border border-neutral-800">
          <button
            onClick={() => setMode('color-digits')}
            className={`px-2.5 py-1 rounded-md text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
              mode === 'color-digits'
                ? 'bg-neutral-800 text-amber-300 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="Color-coded 3-bit digit matrix"
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Color Digits</span>
          </button>

          <button
            onClick={() => setMode('raw-digits')}
            className={`px-2.5 py-1 rounded-md text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
              mode === 'raw-digits'
                ? 'bg-neutral-800 text-amber-300 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="Plain ASCII monospace text matrix"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Plain TXT</span>
          </button>

          <button
            onClick={() => setMode('pixels')}
            className={`px-2.5 py-1 rounded-md text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
              mode === 'pixels'
                ? 'bg-neutral-800 text-amber-300 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="Crisp dithered pixel preview"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pixels</span>
          </button>

          <button
            onClick={() => setMode('split-compare')}
            className={`px-2.5 py-1 rounded-md text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
              mode === 'split-compare'
                ? 'bg-neutral-800 text-amber-300 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="Interactive before / after split slider"
          >
            <SplitSquareHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Compare</span>
          </button>
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-mono text-neutral-400 tabular-nums px-2 hidden sm:inline">
            {Math.round(zoom * 100)}%
          </span>

          <button
            onClick={() => setZoom(z => Math.min(6, z * 1.25))}
            className="p-1.5 rounded-md border border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setZoom(z => Math.max(0.2, z / 1.25))}
            className="p-1.5 rounded-md border border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
            className="p-1.5 rounded-md border border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors cursor-pointer"
            title="Reset Zoom & Pan (100%)"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              if (containerRef.current) {
                const cw = containerRef.current.clientWidth;
                const ch = containerRef.current.clientHeight;
                const fitZ = Math.min((cw - 40) / (width * 8), (ch - 40) / (height * 12), 2.5);
                setZoom(Math.max(0.4, fitZ));
                setPan({ x: 0, y: 0 });
              }
            }}
            className="p-1.5 rounded-md border border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors cursor-pointer"
            title="Fit to Screen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`flex-1 relative overflow-hidden select-none flex items-center justify-center p-6 ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.04) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      >
        {/* Processing Indicator */}
        {isProcessing && (
          <div className="absolute inset-0 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center z-20">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-amber-400 font-mono text-xs">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Dithering Matrix...</span>
            </div>
          </div>
        )}

        {/* Transform Wrapper for Pan and Zoom */}
        <div
          className="transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          {/* MODE 1: COLOR-CODED DIGITS GRID */}
          {mode === 'color-digits' && (
            <div
              className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 shadow-2xl font-mono leading-none tracking-tight inline-block"
              style={{
                fontSize: '11px',
                lineHeight: '1.05',
                letterSpacing: '0.05em',
              }}
            >
              {digits.map((row, y) => (
                <div key={y} className="flex whitespace-nowrap">
                  {row.map((char, x) => {
                    const color = result.pixelColors[y][x];
                    const colorIdx = paletteIndices[y][x];
                    const hex = palette.colors[colorIdx]?.hex || '#fff';
                    const colorName = palette.colors[colorIdx]?.name || `Color ${colorIdx}`;

                    return (
                      <span
                        key={x}
                        onMouseEnter={() =>
                          setHoveredCell({
                            x,
                            y,
                            digit: char,
                            index: colorIdx,
                            colorName,
                            hex,
                            rgb: [color.r, color.g, color.b],
                          })
                        }
                        className="inline-block text-center hover:scale-150 hover:z-20 hover:font-bold hover:brightness-125 transition-transform"
                        style={{
                          width: '1ch',
                          color: `rgb(${color.r}, ${color.g}, ${color.b})`,
                          textShadow:
                            color.r > 200 || color.g > 200 || color.b > 200
                              ? `0 0 3px rgba(${color.r},${color.g},${color.b},0.4)`
                              : 'none',
                        }}
                      >
                        {char}
                      </span>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          {/* MODE 2: MONOCHROME PLAIN TEXT */}
          {mode === 'raw-digits' && (
            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 shadow-2xl font-mono leading-none tracking-tight text-neutral-300 inline-block">
              <pre
                className="font-mono select-text"
                style={{
                  fontSize: '10px',
                  lineHeight: '1.05',
                  letterSpacing: '0.05em',
                }}
              >
                {rawTextContent}
              </pre>
            </div>
          )}

          {/* MODE 3: PIXEL CANVAS */}
          {mode === 'pixels' && (
            <div className="p-2 rounded-xl border border-neutral-800 bg-neutral-950 shadow-2xl inline-block">
              <canvas
                ref={canvasRef}
                className="block"
                style={{
                  imageRendering: 'pixelated',
                  width: `${width * 8}px`,
                  height: `${height * 8}px`,
                }}
              />
            </div>
          )}

          {/* MODE 4: SPLIT COMPARE (Original vs Dithered) */}
          {mode === 'split-compare' && (
            <div
              className="relative rounded-xl border border-neutral-800 bg-neutral-950 shadow-2xl overflow-hidden"
              style={{
                width: `${width * 8}px`,
                height: `${height * 8}px`,
              }}
              onMouseDown={e => e.stopPropagation()} // Let slider work without dragging
            >
              {/* Layer 1 (Bottom): Dithered Image Canvas */}
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full block"
                style={{ imageRendering: 'pixelated' }}
              />

              {/* Layer 2 (Top, Clipped): Original Source Image */}
              {sourceImage && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${splitPos}%` }}
                >
                  <img
                    src={sourceImage.src}
                    alt="Original"
                    className="absolute inset-0 max-w-none"
                    style={{
                      width: `${width * 8}px`,
                      height: `${height * 8}px`,
                      objectFit: 'fill',
                    }}
                  />
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[10px] font-mono text-neutral-200 border border-white/10">
                    Original
                  </div>
                </div>
              )}

              {/* Slider Divider Bar */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-amber-400 cursor-ew-resize z-10"
                style={{ left: `${splitPos}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-neutral-900 border-2 border-amber-400 flex items-center justify-center shadow-lg">
                  <SplitSquareHorizontal className="w-3 h-3 text-amber-400" />
                </div>
              </div>

              {/* Split Slider range input invisible overlay */}
              <input
                type="range"
                min="0"
                max="100"
                value={splitPos}
                onChange={e => setSplitPos(parseFloat(e.target.value))}
                className="absolute inset-0 opacity-0 cursor-ew-resize z-20 w-full h-full"
              />

              <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[10px] font-mono text-amber-300 border border-amber-500/20">
                3-Bit Dithered
              </div>
            </div>
          )}
        </div>

        {/* Hover Inspector Tooltip (Floating Bottom Left) */}
        {hoveredCell && mode === 'color-digits' && (
          <div className="absolute bottom-12 left-4 z-20 px-3 py-2 rounded-lg bg-neutral-900/90 backdrop-blur-md border border-neutral-700/80 text-xs font-mono flex items-center gap-3 shadow-xl">
            <div
              className="w-4 h-4 rounded border border-white/20 shrink-0"
              style={{ backgroundColor: hoveredCell.hex }}
            />
            <div className="flex items-center gap-2 text-neutral-300">
              <span>
                <strong className="text-amber-400">({hoveredCell.x}, {hoveredCell.y})</strong>
              </span>
              <span className="text-neutral-600">·</span>
              <span>
                Digit: <strong className="text-amber-300">'{hoveredCell.digit}'</strong>
              </span>
              <span className="text-neutral-600">·</span>
              <span>
                {hoveredCell.colorName} ({hoveredCell.hex})
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Status & Metadata Bar */}
      <div className="h-8 px-4 border-t border-neutral-800/80 bg-neutral-900/80 text-neutral-400 flex items-center justify-between text-xs font-mono shrink-0">
        <div className="flex items-center gap-3">
          <span className="tabular-nums">
            {width} × {height} cols
          </span>
          <span className="text-neutral-600">·</span>
          <span className="tabular-nums">
            {(width * height).toLocaleString()} total digits
          </span>
          <span className="text-neutral-600">·</span>
          <span className="text-neutral-300">{palette.name}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-neutral-500">
            Dither in <strong className="text-neutral-300 font-semibold">{result.executionTimeMs.toFixed(1)}ms</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
