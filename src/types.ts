export type DitherAlgorithm = 
  | 'floyd-steinberg'
  | 'atkinson'
  | 'bayer-4x4'
  | 'bayer-8x8'
  | 'bayer-2x2'
  | 'sierra-2'
  | 'burkes'
  | 'none';

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export interface PaletteColor {
  digit: string;      // Usually '0' through '7'
  name: string;       // e.g. "Black", "Blue"
  rgb: [number, number, number];
  hex: string;
}

export interface PalettePreset {
  id: string;
  name: string;
  description: string;
  colors: PaletteColor[];
}

export interface DitherSettings {
  algorithm: DitherAlgorithm;
  errorDiffusionStrength: number; // 0.0 to 1.0 (default 1.0)
  serpentine: boolean;            // alternate scanning direction
  colorMatching: 'perceptual' | 'euclidean';
  customDigits: string[];         // 8 characters, default ['0','1','2','3','4','5','6','7']
  invertDigits: boolean;
}

export interface ImageAdjustments {
  width: number;                  // Target column count (e.g. 64)
  aspectRatioCompensation: boolean; // monospaced text is taller (~0.55 width-to-height)
  brightness: number;             // -100 to 100
  contrast: number;               // -100 to 100
  gamma: number;                  // 0.2 to 3.0 (default 1.0)
  saturation: number;             // 0 to 200 (default 100)
  invert: boolean;
}

export type PreviewMode = 'color-digits' | 'raw-digits' | 'pixels' | 'split-compare';

export type ExportFormat = 
  | 'txt-raw'
  | 'txt-spaced'
  | 'csv'
  | 'txt-header'
  | 'code-c'
  | 'code-python'
  | 'code-json'
  | 'code-qbasic'
  | 'ansi-terminal';

export interface ProcessedResult {
  digits: string[][];         // 2D matrix of characters
  paletteIndices: number[][]; // 2D matrix of numbers 0-7
  pixelColors: RGBColor[][];  // 2D matrix of quantized RGB colors
  width: number;
  height: number;
  palette: PalettePreset;
  executionTimeMs: number;
}
