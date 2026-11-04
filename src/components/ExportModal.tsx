import React, { useState, useMemo } from 'react';
import { ExportFormat, ProcessedResult } from '../types';
import {
  generateExportContent,
  downloadFile,
  copyToClipboard,
  downloadDitheredImagePng,
} from '../utils/export';
import {
  Download,
  Copy,
  Check,
  X,
  FileCode,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ProcessedResult | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  result,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('txt-raw');
  const [copied, setCopied] = useState(false);
  const [customFilename, setCustomFilename] = useState('');

  const formats: { id: ExportFormat; name: string; ext: string; desc: string }[] = [
    { id: 'txt-raw', name: 'Raw Digits TXT', ext: 'txt', desc: 'Compact rows of digits (one line per row)' },
    { id: 'txt-spaced', name: 'Spaced Digits TXT', ext: 'txt', desc: 'Digits separated by space (0 1 2 3 ...)' },
    { id: 'txt-header', name: 'TXT with Header', ext: 'txt', desc: 'Commented metadata header followed by digit matrix' },
    { id: 'csv', name: 'CSV Matrix', ext: 'csv', desc: 'Comma-separated values for spreadsheets or analysis' },
    { id: 'code-c', name: 'C / C++ Array', ext: 'h', desc: 'Embedded uint8_t 2D array header file' },
    { id: 'code-python', name: 'Python Array', ext: 'py', desc: 'Python 2D nested list variable definition' },
    { id: 'code-json', name: 'JSON Matrix', ext: 'json', desc: 'Structured JSON with metadata and 2D digit grid' },
    { id: 'code-qbasic', name: 'QBasic / QB64 Program', ext: 'bas', desc: 'Executable MS-DOS QuickBASIC code with SCREEN 13 & DATA statements' },
    { id: 'ansi-terminal', name: 'ANSI Colored TXT', ext: 'txt', desc: 'Shell color codes: render in terminal via cat' },
  ];

  const currentFormatObj = formats.find(f => f.id === selectedFormat) || formats[0];

  const defaultFilename = useMemo(() => {
    if (!result) return 'digits.txt';
    const cleanPalette = result.palette.id.replace(/[^a-zA-Z0-9]/g, '-');
    return `digits-${cleanPalette}-${result.width}x${result.height}.${currentFormatObj.ext}`;
  }, [result, currentFormatObj]);

  const outputContent = useMemo(() => {
    if (!result) return '';
    return generateExportContent(result, selectedFormat);
  }, [result, selectedFormat]);

  if (!isOpen || !result) return null;

  const handleCopy = async () => {
    const success = await copyToClipboard(outputContent);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const filename = customFilename.trim() || defaultFilename;
    const mimeMap: Record<string, string> = {
      txt: 'text/plain;charset=utf-8',
      csv: 'text/csv;charset=utf-8',
      h: 'text/x-c;charset=utf-8',
      py: 'text/x-python;charset=utf-8',
      json: 'application/json;charset=utf-8',
      bas: 'text/plain;charset=utf-8',
    };
    const mime = mimeMap[currentFormatObj.ext] || 'text/plain;charset=utf-8';
    downloadFile(outputContent, filename, mime);
  };

  const handleDownloadPng = () => {
    const pngName = `dithered-${result.width}x${result.height}.png`;
    downloadDitheredImagePng(result, 8, pngName);
  };

  const approxBytes = new Blob([outputContent]).size;
  const formattedSize =
    approxBytes < 1024
      ? `${approxBytes} B`
      : `${(approxBytes / 1024).toFixed(1)} KB`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-100">
                Export 3-Bit Digit Matrix
              </h2>
              <p className="text-xs text-neutral-400">
                Download formatted .TXT files, code arrays, or copy to clipboard
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

        {/* Modal Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Format Navigation List */}
          <div className="w-full md:w-64 border-r border-neutral-800/80 bg-neutral-950/40 p-3 space-y-1 overflow-y-auto shrink-0">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 px-2 block mb-1">
              Select Output Format
            </span>
            {formats.map(fmt => (
              <button
                key={fmt.id}
                onClick={() => setSelectedFormat(fmt.id)}
                className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-0.5 ${
                  selectedFormat === fmt.id
                    ? 'border-amber-500/80 bg-amber-500/10 text-amber-200 shadow-sm'
                    : 'border-transparent hover:border-neutral-800 hover:bg-neutral-900/60 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold">{fmt.name}</span>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase">
                    .{fmt.ext}
                  </span>
                </div>
                <span className="text-[10px] text-neutral-500 line-clamp-1 leading-snug">
                  {fmt.desc}
                </span>
              </button>
            ))}

            <div className="pt-3 mt-3 border-t border-neutral-800/60">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 px-2 block mb-1.5">
                Image Asset Export
              </span>
              <button
                onClick={handleDownloadPng}
                className="w-full text-left p-2.5 rounded-xl border border-neutral-800 hover:border-neutral-700 bg-neutral-900/50 hover:bg-neutral-900 text-neutral-300 transition-colors flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-mono font-medium">Upscaled PNG (8×)</span>
                </div>
                <Download className="w-3.5 h-3.5 text-neutral-400" />
              </button>
            </div>
          </div>

          {/* Right Live Preview & Export Panel */}
          <div className="flex-1 flex flex-col overflow-hidden bg-neutral-950 p-4">
            {/* Header info & filename input */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-800/80 text-xs font-mono">
              <div className="flex items-center gap-2 text-neutral-400">
                <span className="text-neutral-200 font-semibold">{currentFormatObj.name}</span>
                <span>·</span>
                <span className="tabular-nums">{result.width} × {result.height}</span>
                <span>·</span>
                <span className="tabular-nums">{formattedSize}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-neutral-500 text-[11px]">Filename:</span>
                <input
                  type="text"
                  placeholder={defaultFilename}
                  value={customFilename}
                  onChange={e => setCustomFilename(e.target.value)}
                  className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-xs text-neutral-200 font-mono w-48 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Code / Text Preview Viewport */}
            <div className="flex-1 overflow-auto my-3 p-3 bg-neutral-900/90 rounded-xl border border-neutral-800/80 font-mono text-[11px] leading-tight select-text text-neutral-300">
              <pre className="whitespace-pre">{outputContent}</pre>
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
              <span className="text-[11px] font-mono text-neutral-500">
                Ready to save or pipe into your pipeline
              </span>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleCopy}
                  className="px-3.5 py-1.5 text-xs font-mono font-medium rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-200 hover:bg-neutral-700 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-400 stroke-[2.5]" />
                      <span className="text-green-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy All</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownload}
                  className="px-4 py-1.5 text-xs font-mono font-semibold rounded-lg bg-amber-500 text-neutral-950 hover:bg-amber-400 active:scale-98 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-amber-500/20"
                >
                  <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Download .{currentFormatObj.ext.toUpperCase()}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
