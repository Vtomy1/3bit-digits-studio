import React from 'react';
import { Download, FileText, HelpCircle, Palette } from 'lucide-react';

interface HeaderProps {
  onQuickDownloadTxt: () => void;
  onOpenExportModal: () => void;
  onOpenPaletteEditor: () => void;
  onOpenGuide: () => void;
  hasResult: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onQuickDownloadTxt,
  onOpenExportModal,
  onOpenPaletteEditor,
  onOpenGuide,
  hasResult,
}) => {
  return (
    <header className="h-16 px-4 md:px-6 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800/80 flex items-center justify-between z-30 sticky top-0">
      {/* Zone 1: Single Wordmark */}
      <div className="flex items-center gap-3">
        <a href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-mono font-bold text-amber-400 text-sm tracking-tighter group-hover:border-amber-400/60 transition-colors">
            3b
          </div>
          <span className="font-semibold text-base tracking-tight text-neutral-100 group-hover:text-amber-300 transition-colors">
            BitDigit Studio
          </span>
        </a>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-400">
        <button
          onClick={onOpenPaletteEditor}
          className="flex items-center gap-1.5 hover:text-neutral-100 transition-colors text-xs uppercase tracking-wider font-mono cursor-pointer"
        >
          <Palette className="w-3.5 h-3.5 text-neutral-500" />
          <span>Palette Matrix</span>
        </button>
        <button
          onClick={onOpenGuide}
          className="flex items-center gap-1.5 hover:text-neutral-100 transition-colors text-xs uppercase tracking-wider font-mono cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5 text-neutral-500" />
          <span>Dither Handbook</span>
        </button>
      </nav>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenExportModal}
          disabled={!hasResult}
          className="px-3.5 py-1.5 text-xs font-mono font-medium rounded-lg border border-neutral-700 bg-neutral-800/80 text-neutral-200 hover:bg-neutral-700 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          title="Open advanced export options (C arrays, CSV, Python, formatted TXT)"
        >
          <FileText className="w-3.5 h-3.5 text-neutral-400" />
          <span>Export Options</span>
        </button>

        <button
          onClick={onQuickDownloadTxt}
          disabled={!hasResult}
          className="px-4 py-1.5 text-xs font-mono font-semibold rounded-lg bg-amber-500 text-neutral-950 hover:bg-amber-400 active:scale-98 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-sm shadow-amber-500/20"
          title="Directly download .txt file containing image digits"
        >
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Download .TXT</span>
        </button>
      </div>
    </header>
  );
};
