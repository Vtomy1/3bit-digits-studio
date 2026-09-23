import React, { useState } from 'react';
import {
  DitherAlgorithm,
  DitherSettings,
  ImageAdjustments,
  PalettePreset,
} from '../types';
import { PALETTE_PRESETS } from '../utils/palettes';
import {
  RotateCcw,
  Sliders,
  Sparkles,
  Palette as PaletteIcon,
  Maximize2,
  Info,
} from 'lucide-react';

interface SidebarControlsProps {
  palette: PalettePreset;
  onPaletteChange: (palette: PalettePreset) => void;
  ditherSettings: DitherSettings;
  onDitherSettingsChange: (settings: DitherSettings) => void;
  adjustments: ImageAdjustments;
  onAdjustmentsChange: (adjustments: ImageAdjustments) => void;
  calculatedHeight: number;
  onOpenPaletteEditor: () => void;
}

export const SidebarControls: React.FC<SidebarControlsProps> = ({
  palette,
  onPaletteChange,
  ditherSettings,
  onDitherSettingsChange,
  adjustments,
  onAdjustmentsChange,
  calculatedHeight,
  onOpenPaletteEditor,
}) => {
  const [activeTab, setActiveTab] = useState<'palette' | 'dither' | 'adjust'>('palette');

  const algorithms: { id: DitherAlgorithm; name: string; tag: string }[] = [
    { id: 'floyd-steinberg', name: 'Floyd-Steinberg', tag: 'Diffusion' },
    { id: 'atkinson', name: 'Atkinson (Mac)', tag: 'Retro 3/4' },
    { id: 'bayer-4x4', name: 'Bayer 4×4', tag: 'Ordered' },
    { id: 'bayer-8x8', name: 'Bayer 8×8', tag: 'Fine Order' },
    { id: 'bayer-2x2', name: 'Bayer 2×2', tag: 'Coarse' },
    { id: 'sierra-2', name: 'Sierra-2', tag: '2-Row' },
    { id: 'burkes', name: 'Burkes', tag: 'Smooth' },
    { id: 'none', name: 'Nearest (No Dither)', tag: 'Flat' },
  ];

  const quickWidths = [32, 48, 64, 80, 100, 128];

  const handleResetAdjustments = () => {
    onAdjustmentsChange({
      ...adjustments,
      brightness: 0,
      contrast: 0,
      gamma: 1.0,
      saturation: 100,
      invert: false,
    });
  };

  return (
    <div className="flex flex-col h-full bg-neutral-900/60 border-r border-neutral-800/80">
      {/* Tab Switcher */}
      <div className="flex border-b border-neutral-800 p-2 gap-1 bg-neutral-950/40">
        <button
          onClick={() => setActiveTab('palette')}
          className={`flex-1 py-1.5 px-2 rounded-md text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'palette'
              ? 'bg-neutral-800 text-amber-300 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <PaletteIcon className="w-3.5 h-3.5" />
          <span>Palette</span>
        </button>

        <button
          onClick={() => setActiveTab('dither')}
          className={`flex-1 py-1.5 px-2 rounded-md text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'dither'
              ? 'bg-neutral-800 text-amber-300 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Dither</span>
        </button>

        <button
          onClick={() => setActiveTab('adjust')}
          className={`flex-1 py-1.5 px-2 rounded-md text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'adjust'
              ? 'bg-neutral-800 text-amber-300 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Image</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs text-neutral-300">
        {/* PALETTE TAB */}
        {activeTab === 'palette' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                  3-Bit Color Palette
                </label>
                <button
                  onClick={onOpenPaletteEditor}
                  className="text-[11px] font-mono text-amber-400 hover:underline cursor-pointer"
                >
                  Custom Colors
                </button>
              </div>

              <select
                value={palette.id}
                onChange={e => {
                  const found = PALETTE_PRESETS.find(p => p.id === e.target.value);
                  if (found) onPaletteChange(found);
                }}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-neutral-200 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {PALETTE_PRESETS.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-neutral-500 mt-1">{palette.description}</p>
            </div>

            {/* 8-Color Digit Map Grid */}
            <div className="bg-neutral-950/60 rounded-xl p-3 border border-neutral-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase text-neutral-500">
                  Digit-to-Color Mapping (0–7)
                </span>
                <span className="text-[10px] font-mono text-neutral-400 tabular-nums">
                  8 Colors
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {palette.colors.map(c => (
                  <div
                    key={c.digit}
                    className="flex flex-col items-center bg-neutral-900 border border-neutral-800/80 rounded-lg p-1.5"
                  >
                    <div
                      className="w-full h-5 rounded border border-white/10 shadow-inner mb-1"
                      style={{ backgroundColor: c.hex }}
                    />
                    <div className="flex items-center justify-between w-full px-0.5">
                      <span className="font-mono font-bold text-amber-400 text-xs">
                        {c.digit}
                      </span>
                      <span className="font-mono text-[9px] text-neutral-400 uppercase truncate">
                        {c.hex.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Digit Inversion & Glyphs */}
            <div className="space-y-3 pt-1 border-t border-neutral-800/60">
              <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                Digit Output Glyphs
              </label>

              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-300">Invert Digit Sequence</span>
                <button
                  type="button"
                  onClick={() =>
                    onDitherSettingsChange({
                      ...ditherSettings,
                      invertDigits: !ditherSettings.invertDigits,
                    })
                  }
                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                    ditherSettings.invertDigits ? 'bg-amber-500' : 'bg-neutral-800'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      ditherSettings.invertDigits ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] text-neutral-400">Digit Characters:</span>
                <div className="grid grid-cols-8 gap-1">
                  {(ditherSettings.customDigits || ['0', '1', '2', '3', '4', '5', '6', '7']).map(
                    (char, idx) => (
                      <input
                        key={idx}
                        type="text"
                        maxLength={1}
                        value={char}
                        onChange={e => {
                          const next = [...(ditherSettings.customDigits || ['0', '1', '2', '3', '4', '5', '6', '7'])];
                          next[idx] = e.target.value || String(idx);
                          onDitherSettingsChange({
                            ...ditherSettings,
                            customDigits: next,
                          });
                        }}
                        className="w-full text-center bg-neutral-950 border border-neutral-800 rounded py-1 font-mono text-xs text-amber-300 focus:outline-none focus:border-amber-400"
                      />
                    )
                  )}
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() =>
                      onDitherSettingsChange({
                        ...ditherSettings,
                        customDigits: ['0', '1', '2', '3', '4', '5', '6', '7'],
                      })
                    }
                    className="text-[10px] font-mono text-neutral-500 hover:text-neutral-300 cursor-pointer"
                  >
                    Reset to 0–7
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DITHER TAB */}
        {activeTab === 'dither' && (
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block mb-2">
                Dithering Algorithm
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {algorithms.map(alg => (
                  <button
                    key={alg.id}
                    onClick={() =>
                      onDitherSettingsChange({
                        ...ditherSettings,
                        algorithm: alg.id,
                      })
                    }
                    className={`p-2 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      ditherSettings.algorithm === alg.id
                        ? 'border-amber-500/80 bg-amber-500/10 text-amber-200 shadow-sm'
                        : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                    }`}
                  >
                    <span className="font-mono text-xs font-semibold">{alg.name}</span>
                    <span className="text-[10px] text-neutral-500 mt-1">{alg.tag}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Error Diffusion Strength */}
            {ditherSettings.algorithm !== 'none' && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                    Dither Intensity
                  </label>
                  <span className="font-mono text-xs text-amber-400 tabular-nums">
                    {Math.round(ditherSettings.errorDiffusionStrength * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={ditherSettings.errorDiffusionStrength}
                  onChange={e =>
                    onDitherSettingsChange({
                      ...ditherSettings,
                      errorDiffusionStrength: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            )}

            {/* Serpentine Scanning (only relevant for error diffusion) */}
            {['floyd-steinberg', 'atkinson', 'sierra-2', 'burkes'].includes(
              ditherSettings.algorithm
            ) && (
              <div className="flex items-center justify-between py-1">
                <div>
                  <span className="text-xs text-neutral-200 block">Serpentine Scanning</span>
                  <span className="text-[10px] text-neutral-500 block">
                    Alternates row direction to suppress worm artifacts
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onDitherSettingsChange({
                      ...ditherSettings,
                      serpentine: !ditherSettings.serpentine,
                    })
                  }
                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                    ditherSettings.serpentine ? 'bg-amber-500' : 'bg-neutral-800'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      ditherSettings.serpentine ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            )}

            {/* Color Matching Metric */}
            <div className="space-y-1.5 pt-2 border-t border-neutral-800/60">
              <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block">
                Color Distance Metric
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() =>
                    onDitherSettingsChange({
                      ...ditherSettings,
                      colorMatching: 'perceptual',
                    })
                  }
                  className={`py-1.5 px-2 rounded-md font-mono text-xs border text-center transition-all cursor-pointer ${
                    ditherSettings.colorMatching === 'perceptual'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-300 font-semibold'
                      : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  Perceptual
                </button>
                <button
                  onClick={() =>
                    onDitherSettingsChange({
                      ...ditherSettings,
                      colorMatching: 'euclidean',
                    })
                  }
                  className={`py-1.5 px-2 rounded-md font-mono text-xs border text-center transition-all cursor-pointer ${
                    ditherSettings.colorMatching === 'euclidean'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-300 font-semibold'
                      : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  Euclidean RGB
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ADJUST & RESOLUTION TAB */}
        {activeTab === 'adjust' && (
          <div className="space-y-4">
            {/* Target Width (Columns) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                  Target Width (Columns)
                </label>
                <span className="font-mono text-xs text-amber-400 tabular-nums">
                  {adjustments.width} cols × {calculatedHeight} rows
                </span>
              </div>
              <input
                type="range"
                min="16"
                max="160"
                step="4"
                value={adjustments.width}
                onChange={e =>
                  onAdjustmentsChange({
                    ...adjustments,
                    width: parseInt(e.target.value, 10),
                  })
                }
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex gap-1">
                {quickWidths.map(w => (
                  <button
                    key={w}
                    onClick={() =>
                      onAdjustmentsChange({
                        ...adjustments,
                        width: w,
                      })
                    }
                    className={`flex-1 py-1 rounded text-[10px] font-mono border transition-colors cursor-pointer ${
                      adjustments.width === w
                        ? 'border-amber-500 text-amber-300 bg-amber-500/10'
                        : 'border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            {/* Monospace Aspect Ratio Compensation */}
            <div className="p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-neutral-200">Monospace Ratio Fix</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onAdjustmentsChange({
                      ...adjustments,
                      aspectRatioCompensation: !adjustments.aspectRatioCompensation,
                    })
                  }
                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                    adjustments.aspectRatioCompensation ? 'bg-amber-500' : 'bg-neutral-800'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      adjustments.aspectRatioCompensation
                        ? 'translate-x-5'
                        : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
              <p className="text-[10px] text-neutral-500 flex items-start gap-1">
                <Info className="w-3 h-3 text-neutral-400 shrink-0 mt-0.5" />
                <span>
                  Adjusts row count by ~0.55× so text editors don't vertically stretch the image.
                </span>
              </p>
            </div>

            {/* Brightness */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                  Brightness
                </label>
                <span className="font-mono text-xs text-neutral-300 tabular-nums">
                  {adjustments.brightness > 0 ? `+${adjustments.brightness}` : adjustments.brightness}
                </span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={adjustments.brightness}
                onChange={e =>
                  onAdjustmentsChange({
                    ...adjustments,
                    brightness: parseInt(e.target.value, 10),
                  })
                }
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Contrast */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                  Contrast
                </label>
                <span className="font-mono text-xs text-neutral-300 tabular-nums">
                  {adjustments.contrast > 0 ? `+${adjustments.contrast}` : adjustments.contrast}
                </span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={adjustments.contrast}
                onChange={e =>
                  onAdjustmentsChange({
                    ...adjustments,
                    contrast: parseInt(e.target.value, 10),
                  })
                }
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Gamma */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                  Gamma Curve
                </label>
                <span className="font-mono text-xs text-neutral-300 tabular-nums">
                  {adjustments.gamma.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0.3"
                max="2.5"
                step="0.05"
                value={adjustments.gamma}
                onChange={e =>
                  onAdjustmentsChange({
                    ...adjustments,
                    gamma: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Saturation */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                  Saturation
                </label>
                <span className="font-mono text-xs text-neutral-300 tabular-nums">
                  {adjustments.saturation}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                step="5"
                value={adjustments.saturation}
                onChange={e =>
                  onAdjustmentsChange({
                    ...adjustments,
                    saturation: parseInt(e.target.value, 10),
                  })
                }
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Invert */}
            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-neutral-200">Negative / Invert Colors</span>
              <button
                type="button"
                onClick={() =>
                  onAdjustmentsChange({
                    ...adjustments,
                    invert: !adjustments.invert,
                  })
                }
                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                  adjustments.invert ? 'bg-amber-500' : 'bg-neutral-800'
                }`}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                    adjustments.invert ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <button
              onClick={handleResetAdjustments}
              className="w-full py-1.5 px-3 rounded-lg border border-neutral-800 hover:border-neutral-700 bg-neutral-950/60 text-neutral-400 hover:text-neutral-200 font-mono text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Image Controls</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
