import React, { useState } from 'react';
import { PaletteColor, PalettePreset } from '../types';
import { PALETTE_PRESETS, hexToRgb, rgbToHex } from '../utils/palettes';
import { Palette, X, RotateCcw, Check } from 'lucide-react';

interface PaletteEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPalette: PalettePreset;
  onSavePalette: (palette: PalettePreset) => void;
}

export const PaletteEditorModal: React.FC<PaletteEditorModalProps> = ({
  isOpen,
  onClose,
  currentPalette,
  onSavePalette,
}) => {
  const [colors, setColors] = useState<PaletteColor[]>(() => [...currentPalette.colors]);
  const [paletteName, setPaletteName] = useState(currentPalette.name);

  if (!isOpen) return null;

  const handleColorChange = (index: number, newHex: string) => {
    const updated = [...colors];
    const rgb = hexToRgb(newHex);
    updated[index] = {
      ...updated[index],
      hex: newHex,
      rgb,
    };
    setColors(updated);
  };

  const handleNameChange = (index: number, newName: string) => {
    const updated = [...colors];
    updated[index] = {
      ...updated[index],
      name: newName,
    };
    setColors(updated);
  };

  const handleLoadPreset = (preset: PalettePreset) => {
    setColors([...preset.colors]);
    setPaletteName(preset.name);
  };

  const handleSave = () => {
    const customPreset: PalettePreset = {
      id: 'custom-' + Date.now(),
      name: paletteName.trim() || 'Custom 3-Bit Palette',
      description: 'User-configured 8-color palette matrix',
      colors,
    };
    onSavePalette(customPreset);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-100">
                3-Bit Palette Matrix Editor
              </h2>
              <p className="text-xs text-neutral-400">
                Fine-tune each of the 8 colors (digits 0 through 7)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-200 p-1.5 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Quick preset loader */}
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block mb-1.5">
              Load Base Preset
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PALETTE_PRESETS.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleLoadPreset(p)}
                  className="px-2.5 py-1 rounded-md text-[11px] font-mono border border-neutral-800 hover:border-neutral-700 bg-neutral-950 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Palette Name */}
          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
              Palette Name
            </label>
            <input
              type="text"
              value={paletteName}
              onChange={e => setPaletteName(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-neutral-200 focus:outline-none focus:border-amber-400"
              placeholder="Custom 3-Bit Palette"
            />
          </div>

          {/* 8 Color Rows */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block">
              Color Channels (8 Digits)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {colors.map((c, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-neutral-950/70 border border-neutral-800/80"
                >
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-white/20 shadow-inner">
                    <input
                      type="color"
                      value={c.hex}
                      onChange={e => handleColorChange(idx, e.target.value)}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                    <div
                      className="w-full h-full"
                      style={{ backgroundColor: c.hex }}
                    />
                  </div>

                  <div className="w-5 text-center font-mono font-bold text-amber-400 text-sm shrink-0">
                    {c.digit}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <input
                      type="text"
                      value={c.name}
                      onChange={e => handleNameChange(idx, e.target.value)}
                      className="w-full bg-transparent border-b border-transparent hover:border-neutral-700 focus:border-amber-400 text-xs text-neutral-200 font-mono px-1 py-0.5 focus:outline-none"
                    />
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-500 px-1">
                      <span>{c.hex.toUpperCase()}</span>
                      <span>·</span>
                      <span>RGB({c.rgb.join(', ')})</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950/60 flex items-center justify-between">
          <button
            onClick={() => handleLoadPreset(PALETTE_PRESETS[0])}
            className="text-xs font-mono text-neutral-400 hover:text-neutral-200 flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Standard 3-Bit</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-mono text-neutral-400 hover:text-neutral-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 text-xs font-mono font-semibold rounded-lg bg-amber-500 text-neutral-950 hover:bg-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Apply Palette</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
