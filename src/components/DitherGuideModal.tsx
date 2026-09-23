import React from 'react';
import { HelpCircle, X, Terminal, Cpu, Layers } from 'lucide-react';

interface DitherGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DitherGuideModal: React.FC<DitherGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-100">
                3-Bit Palette & Dithering Handbook
              </h2>
              <p className="text-xs text-neutral-400">
                Foundations of 8-color quantization, error diffusion, and TXT matrix export
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
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-neutral-300 leading-relaxed font-sans">
          {/* Section 1 */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-amber-400 font-mono flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>1. The 3-Bit Architecture (8 Discrete Values)</span>
            </h3>
            <p>
              In digital computing, 3 bits ($2^3 = 8$) represent eight distinct states: binary <code className="font-mono text-amber-300">000</code> through <code className="font-mono text-amber-300">111</code>. In standard color theory, this corresponds to 1 bit per RGB channel (Red on/off, Green on/off, Blue on/off), producing the classic 8 computer colors:
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 font-mono text-[11px] text-center my-2">
              <div className="bg-neutral-950 p-1.5 rounded border border-neutral-800">
                <span className="text-neutral-400 block font-bold">0</span>
                <span className="text-[10px] text-neutral-500">Black</span>
              </div>
              <div className="bg-neutral-950 p-1.5 rounded border border-neutral-800">
                <span className="text-blue-400 block font-bold">1</span>
                <span className="text-[10px] text-neutral-500">Blue</span>
              </div>
              <div className="bg-neutral-950 p-1.5 rounded border border-neutral-800">
                <span className="text-green-400 block font-bold">2</span>
                <span className="text-[10px] text-neutral-500">Green</span>
              </div>
              <div className="bg-neutral-950 p-1.5 rounded border border-neutral-800">
                <span className="text-cyan-400 block font-bold">3</span>
                <span className="text-[10px] text-neutral-500">Cyan</span>
              </div>
              <div className="bg-neutral-950 p-1.5 rounded border border-neutral-800">
                <span className="text-red-400 block font-bold">4</span>
                <span className="text-[10px] text-neutral-500">Red</span>
              </div>
              <div className="bg-neutral-950 p-1.5 rounded border border-neutral-800">
                <span className="text-fuchsia-400 block font-bold">5</span>
                <span className="text-[10px] text-neutral-500">Magenta</span>
              </div>
              <div className="bg-neutral-950 p-1.5 rounded border border-neutral-800">
                <span className="text-yellow-400 block font-bold">6</span>
                <span className="text-[10px] text-neutral-500">Yellow</span>
              </div>
              <div className="bg-neutral-950 p-1.5 rounded border border-neutral-800">
                <span className="text-neutral-100 block font-bold">7</span>
                <span className="text-[10px] text-neutral-500">White</span>
              </div>
            </div>
            <p className="text-neutral-400">
              In grayscale mode, the 8 states map to 8 evenly stepped luminance levels from deep black (<code className="font-mono text-amber-300">0</code>) to peak white (<code className="font-mono text-amber-300">7</code>).
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-2 pt-2 border-t border-neutral-800/80">
            <h3 className="text-sm font-semibold text-amber-400 font-mono flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              <span>2. Dithering Algorithms Compared</span>
            </h3>
            <div className="space-y-2">
              <div className="bg-neutral-950/70 p-3 rounded-xl border border-neutral-800/80">
                <span className="font-mono font-bold text-neutral-200 block mb-0.5">
                  Floyd-Steinberg (1976)
                </span>
                <p className="text-neutral-400 text-[11px]">
                  Diffuses 100% of the quantization residual error into neighboring pixels across 4 directions ($7/16$ right, $3/16$ down-left, $5/16$ down, $1/16$ down-right). Serpentine scanning alternates traversal left-to-right and right-to-left to suppress directional worm artifacts.
                </p>
              </div>

              <div className="bg-neutral-950/70 p-3 rounded-xl border border-neutral-800/80">
                <span className="font-mono font-bold text-neutral-200 block mb-0.5">
                  Atkinson Dithering (Apple Macintosh, 1984)
                </span>
                <p className="text-neutral-400 text-[11px]">
                  Invented by Bill Atkinson for HyperCard and early Mac OS. Uniquely diffuses only $6/8$ (75%) of the error while discarding the rest, preventing blown-out washed highlights and generating distinct high-contrast retro borders.
                </p>
              </div>

              <div className="bg-neutral-950/70 p-3 rounded-xl border border-neutral-800/80">
                <span className="font-mono font-bold text-neutral-200 block mb-0.5">
                  Ordered Bayer (2×2, 4×4, 8×8)
                </span>
                <p className="text-neutral-400 text-[11px]">
                  Deterministic cross-hatching matrix without spatial error propagation. Yields authentic game console and arcade screen-door pattern textures.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="space-y-2 pt-2 border-t border-neutral-800/80">
            <h3 className="text-sm font-semibold text-amber-400 font-mono flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              <span>3. Monospace Aspect Ratio Correction</span>
            </h3>
            <p>
              Standard terminal and text editor glyphs are not square pixels — they have a character aspect ratio of roughly <strong className="text-neutral-200">1:2</strong> (a glyph is nearly twice as tall as it is wide). If you print a 64×64 digit matrix directly into a text editor, it will appear vertically stretched by ~1.8×.
            </p>
            <p className="text-neutral-400">
              When <strong className="text-amber-300">Monospace Ratio Fix</strong> is enabled in BitDigit Studio, the target row count is mathematically scaled by $\approx 0.55\times$, ensuring that when you view the exported <code className="font-mono text-amber-300">.txt</code> file in Notepad, VS Code, or your shell terminal, the image geometry appears undistorted.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-mono font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
