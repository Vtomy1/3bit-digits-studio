import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, AlertCircle } from 'lucide-react';

interface WebcamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (img: HTMLImageElement, name: string) => void;
}

export const WebcamModal: React.FC<WebcamModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    let activeStream: MediaStream | null = null;
    setIsInitializing(true);
    setError(null);

    navigator.mediaDevices
      ?.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
      })
      .then(s => {
        activeStream = s;
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play();
        }
        setIsInitializing(false);
      })
      .catch(err => {
        console.error('Camera access error:', err);
        setError('Camera access unavailable or permission denied.');
        setIsInitializing(false);
      });

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [isOpen]);

  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
    onClose();
  };

  const handleTakeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video frame (mirroring if selfie)
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const img = new Image();
    img.onload = () => {
      onCapture(img, `webcam-capture-${Date.now()}.jpg`);
      handleClose();
    };
    img.src = dataUrl;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-neutral-100">Live Camera Snapshot</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-neutral-500 hover:text-neutral-200 p-1 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Viewport */}
        <div className="relative aspect-4/3 bg-black flex items-center justify-center overflow-hidden">
          {isInitializing && (
            <div className="flex flex-col items-center gap-2 text-neutral-400 font-mono text-xs">
              <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
              <span>Connecting to camera...</span>
            </div>
          )}

          {error && (
            <div className="p-6 text-center text-xs text-neutral-400 flex flex-col items-center gap-2">
              <AlertCircle className="w-8 h-8 text-amber-500" />
              <p className="font-semibold text-neutral-200">Unable to Access Camera</p>
              <p>{error}</p>
            </div>
          )}

          <video
            ref={videoRef}
            playsInline
            muted
            className={`w-full h-full object-cover scale-x-[-1] ${
              error || isInitializing ? 'hidden' : 'block'
            }`}
          />
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-950/60 border-t border-neutral-800 flex items-center justify-between">
          <span className="text-[11px] font-mono text-neutral-500">
            Center your subject for highest contrast
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              className="px-3 py-1.5 text-xs font-mono text-neutral-400 hover:text-neutral-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleTakeSnapshot}
              disabled={Boolean(error) || isInitializing}
              className="px-4 py-1.5 text-xs font-mono font-semibold rounded-lg bg-amber-500 text-neutral-950 hover:bg-amber-400 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-amber-500/20"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Capture & Dither</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
