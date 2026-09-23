/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useTransition } from 'react';
import {
  DitherSettings,
  ImageAdjustments,
  PalettePreset,
  ProcessedResult,
} from './types';
import { PALETTE_PRESETS } from './utils/palettes';
import { processImageToDigits } from './utils/dithering';
import { generateExportContent, downloadFile } from './utils/export';
import { Header } from './components/Header';
import { SidebarControls } from './components/SidebarControls';
import { ImageUploader } from './components/ImageUploader';
import { DigitPreview } from './components/DigitPreview';
import { ExportModal } from './components/ExportModal';
import { PaletteEditorModal } from './components/PaletteEditorModal';
import { WebcamModal } from './components/WebcamModal';
import { DitherGuideModal } from './components/DitherGuideModal';
import { SAMPLE_PRESETS } from './utils/samples';

export default function App() {
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

  const [palette, setPalette] = useState<PalettePreset>(PALETTE_PRESETS[0]);
  const [ditherSettings, setDitherSettings] = useState<DitherSettings>({
    algorithm: 'floyd-steinberg',
    errorDiffusionStrength: 1.0,
    serpentine: true,
    colorMatching: 'perceptual',
    customDigits: ['0', '1', '2', '3', '4', '5', '6', '7'],
    invertDigits: false,
  });

  const [adjustments, setAdjustments] = useState<ImageAdjustments>({
    width: 64,
    aspectRatioCompensation: true,
    brightness: 0,
    contrast: 10,
    gamma: 1.0,
    saturation: 100,
    invert: false,
  });

  const [result, setResult] = useState<ProcessedResult | null>(null);
  const [isPending, startTransition] = useTransition();

  // Modals
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPaletteEditorOpen, setIsPaletteEditorOpen] = useState(false);
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Quick download toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load default sample on initial mount
  useEffect(() => {
    const defaultSample = SAMPLE_PRESETS[1]; // Cyberpunk pilot
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setSourceImage(img);
      setImageName(`${defaultSample.name}.jpg`);
      setImageDimensions({ width: img.naturalWidth || 512, height: img.naturalHeight || 512 });
      if (defaultSample.recommendedPalette) {
        const p = PALETTE_PRESETS.find(pal => pal.id === defaultSample.recommendedPalette);
        if (p) setPalette(p);
      }
    };
    img.src = defaultSample.url;
  }, []);

  // Compute calculated height
  const calculatedHeight = React.useMemo(() => {
    if (!imageDimensions) return 36;
    const w = adjustments.width;
    const ratio = imageDimensions.height / imageDimensions.width;
    if (adjustments.aspectRatioCompensation) {
      return Math.max(4, Math.round(w * ratio * 0.55));
    }
    return Math.max(4, Math.round(w * ratio));
  }, [imageDimensions, adjustments.width, adjustments.aspectRatioCompensation]);

  // Execute processing whenever inputs change
  useEffect(() => {
    if (!sourceImage) {
      setResult(null);
      return;
    }

    startTransition(() => {
      try {
        const res = processImageToDigits(
          sourceImage,
          palette,
          ditherSettings,
          adjustments
        );
        setResult(res);
      } catch (err) {
        console.error('Error processing image:', err);
      }
    });
  }, [sourceImage, palette, ditherSettings, adjustments]);

  const handleImageLoaded = (img: HTMLImageElement, name: string) => {
    setSourceImage(img);
    setImageName(name);
    setImageDimensions({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
  };

  const handleResetImage = () => {
    setSourceImage(null);
    setImageName(null);
    setImageDimensions(null);
    setResult(null);
  };

  const handleQuickDownloadTxt = () => {
    if (!result) return;
    const content = generateExportContent(result, 'txt-raw');
    const filename = `digits-${result.palette.id}-${result.width}x${result.height}.txt`;
    downloadFile(content, filename);

    setToastMessage(`Downloaded ${filename}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Bar (Single Row Contract) */}
      <Header
        onQuickDownloadTxt={handleQuickDownloadTxt}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenPaletteEditor={() => setIsPaletteEditorOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        hasResult={Boolean(result)}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left Sidebar: Controls & Upload */}
        <aside className="w-full lg:w-96 border-b lg:border-b-0 lg:border-r border-neutral-800 bg-neutral-950/80 flex flex-col shrink-0 max-h-[45vh] lg:max-h-[calc(100vh-4rem)] overflow-y-auto">
          {/* Image Input Section */}
          <div className="p-4 border-b border-neutral-800/80">
            <ImageUploader
              onImageLoaded={handleImageLoaded}
              onOpenWebcam={() => setIsWebcamOpen(true)}
              currentImageName={imageName}
              currentImageDimensions={imageDimensions}
              onResetImage={handleResetImage}
            />
          </div>

          {/* Dithering & Palette Controls */}
          <div className="flex-1">
            <SidebarControls
              palette={palette}
              onPaletteChange={setPalette}
              ditherSettings={ditherSettings}
              onDitherSettingsChange={setDitherSettings}
              adjustments={adjustments}
              onAdjustmentsChange={setAdjustments}
              calculatedHeight={calculatedHeight}
              onOpenPaletteEditor={() => setIsPaletteEditorOpen(true)}
            />
          </div>
        </aside>

        {/* Central Display Viewport */}
        <section className="flex-1 flex flex-col min-w-0 bg-neutral-950 overflow-hidden relative">
          <DigitPreview
            result={result}
            sourceImage={sourceImage}
            isProcessing={isPending}
          />
        </section>
      </main>

      {/* Quick Download Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-12 right-6 z-50 bg-neutral-900 border border-amber-500/40 text-amber-300 px-4 py-2.5 rounded-xl shadow-2xl font-mono text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        result={result}
      />

      <PaletteEditorModal
        isOpen={isPaletteEditorOpen}
        onClose={() => setIsPaletteEditorOpen(false)}
        currentPalette={palette}
        onSavePalette={setPalette}
      />

      <WebcamModal
        isOpen={isWebcamOpen}
        onClose={() => setIsWebcamOpen(false)}
        onCapture={handleImageLoaded}
      />

      <DitherGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
