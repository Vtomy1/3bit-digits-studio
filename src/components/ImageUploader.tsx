import React, { useRef, useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, Sparkles, UploadCloud, X } from 'lucide-react';
import { SAMPLE_PRESETS, SamplePreset, generateTestPatternDataUrl } from '../utils/samples';

interface ImageUploaderProps {
  onImageLoaded: (img: HTMLImageElement, name: string) => void;
  onOpenWebcam: () => void;
  currentImageName: string | null;
  currentImageDimensions: { width: number; height: number } | null;
  onResetImage: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageLoaded,
  onOpenWebcam,
  currentImageName,
  currentImageDimensions,
  onResetImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoadingSample, setIsLoadingSample] = useState(false);

  // Handle global paste event (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.items) {
        for (let i = 0; i < e.clipboardData.items.length; i++) {
          const item = e.clipboardData.items[i];
          if (item.type.indexOf('image') !== -1) {
            const file = item.getAsFile();
            if (file) {
              loadImageFromFile(file);
              e.preventDefault();
              break;
            }
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const loadImageFromFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      const result = e.target?.result as string;
      if (result) {
        loadImageFromUrl(result, file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const loadImageFromUrl = (url: string, name: string) => {
    setIsLoadingSample(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setIsLoadingSample(false);
      onImageLoaded(img, name);
    };
    img.onerror = () => {
      setIsLoadingSample(false);
      console.error('Failed to load image from URL:', url);
    };
    img.src = url;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadImageFromFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      loadImageFromFile(file);
    }
  };

  const handleLoadSample = (sample: SamplePreset) => {
    loadImageFromUrl(sample.url, `${sample.name}.jpg`);
  };

  const handleLoadTestPattern = () => {
    const dataUrl = generateTestPatternDataUrl();
    if (dataUrl) {
      loadImageFromUrl(dataUrl, '3bit-test-pattern.png');
    }
  };

  return (
    <div className="space-y-4">
      {/* File input (hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/bmp,image/svg+xml"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Main Drag & Drop Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative p-4 rounded-xl border border-dashed cursor-pointer transition-all ${
          isDragging
            ? 'border-amber-400 bg-amber-500/10 scale-[1.01]'
            : 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-700 hover:bg-neutral-900/90'
        }`}
      >
        <div className="flex flex-col items-center justify-center text-center py-3">
          <div className="w-10 h-10 rounded-full bg-neutral-800/80 border border-neutral-700/60 flex items-center justify-center text-neutral-300 group-hover:text-amber-400 group-hover:border-amber-400/40 transition-colors mb-2.5">
            <UploadCloud className="w-5 h-5" />
          </div>
          <p className="text-xs font-medium text-neutral-200 mb-1">
            <span className="text-amber-400 group-hover:underline">Choose an image</span> or drag & drop here
          </p>
          <p className="text-[11px] text-neutral-500 font-mono">
            PNG, JPG, WebP · or press Ctrl+V to paste
          </p>
        </div>

        {/* Current image indicator */}
        {currentImageName && currentImageDimensions && (
          <div
            className="mt-2 pt-2 border-t border-neutral-800 flex items-center justify-between text-xs"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <ImageIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate text-neutral-300 font-mono text-[11px]">
                {currentImageName}
              </span>
              <span className="text-neutral-500 text-[10px] font-mono shrink-0">
                ({currentImageDimensions.width}×{currentImageDimensions.height})
              </span>
            </div>
            <button
              onClick={onResetImage}
              title="Clear image"
              className="text-neutral-500 hover:text-red-400 p-1 rounded hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Alternative Input Tools: Webcam & Samples */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
            Quick Preset Imagery
          </span>
          <button
            onClick={onOpenWebcam}
            className="flex items-center gap-1 text-[11px] font-mono text-neutral-400 hover:text-amber-300 transition-colors cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Webcam</span>
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {SAMPLE_PRESETS.map(sample => (
            <button
              key={sample.id}
              onClick={() => handleLoadSample(sample)}
              disabled={isLoadingSample}
              className="group relative rounded-lg overflow-hidden border border-neutral-800 hover:border-amber-500/60 aspect-square bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all cursor-pointer"
              title={`${sample.name}: ${sample.description}`}
            >
              <img
                src={sample.url}
                alt={sample.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1">
                <span className="text-[10px] font-mono text-neutral-200 truncate leading-tight">
                  {sample.name.split(' ')[0]}
                </span>
              </div>
            </button>
          ))}

          {/* Procedural Test Card */}
          <button
            onClick={handleLoadTestPattern}
            className="group relative rounded-lg overflow-hidden border border-neutral-800 hover:border-amber-500/60 aspect-square bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all cursor-pointer flex flex-col items-center justify-center p-1"
            title="Generate 8-Color & Grayscale Diagnostic Test Chart"
          >
            <div className="w-full h-1/2 flex">
              <span className="flex-1 bg-blue-600" />
              <span className="flex-1 bg-green-500" />
              <span className="flex-1 bg-red-500" />
              <span className="flex-1 bg-yellow-400" />
            </div>
            <div className="w-full h-1/2 bg-gradient-to-r from-black to-white" />
            <div className="absolute inset-0 bg-neutral-950/40 group-hover:bg-neutral-950/10 flex items-center justify-center transition-colors">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 drop-shadow" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
