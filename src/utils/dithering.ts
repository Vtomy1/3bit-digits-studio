import {
  DitherSettings,
  ImageAdjustments,
  PaletteColor,
  PalettePreset,
  ProcessedResult,
  RGBColor,
} from '../types';

// Bayer Matrices normalized to [0, 1)
const BAYER_2X2 = [
  [0 / 4, 2 / 4],
  [3 / 4, 1 / 4],
];

const BAYER_4X4 = [
  [0 / 16, 8 / 16, 2 / 16, 10 / 16],
  [12 / 16, 4 / 16, 14 / 16, 6 / 16],
  [3 / 16, 11 / 16, 1 / 16, 9 / 16],
  [15 / 16, 7 / 16, 13 / 16, 5 / 16],
];

const BAYER_8X8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
].map(row => row.map(v => v / 64));

function clamp(val: number, min = 0, max = 255): number {
  return Math.max(min, Math.min(max, val));
}

// Distance matching functions
function getEuclideanDistanceSq(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return dr * dr + dg * dg + db * db;
}

// Redmean perceptual color distance formula
function getPerceptualDistanceSq(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  const rmean = (r1 + r2) / 2;
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return (
    (((512 + rmean) * dr * dr) >> 8) +
    4 * dg * dg +
    (((767 - rmean) * db * db) >> 8)
  );
}

function findNearestColorIndex(
  r: number,
  g: number,
  b: number,
  paletteColors: PaletteColor[],
  metric: 'perceptual' | 'euclidean'
): number {
  let bestIndex = 0;
  let bestDistance = Infinity;

  for (let i = 0; i < paletteColors.length; i++) {
    const [pr, pg, pb] = paletteColors[i].rgb;
    const dist =
      metric === 'perceptual'
        ? getPerceptualDistanceSq(r, g, b, pr, pg, pb)
        : getEuclideanDistanceSq(r, g, b, pr, pg, pb);

    if (dist < bestDistance) {
      bestDistance = dist;
      bestIndex = i;
    }
  }

  return bestIndex;
}

// Apply Brightness, Contrast, Gamma, Saturation, Invert
function applyImageAdjustments(
  r: number,
  g: number,
  b: number,
  adjustments: ImageAdjustments
): [number, number, number] {
  let nr = r;
  let ng = g;
  let nb = b;

  // Invert
  if (adjustments.invert) {
    nr = 255 - nr;
    ng = 255 - ng;
    nb = 255 - nb;
  }

  // Brightness (-100 to 100)
  if (adjustments.brightness !== 0) {
    const bOffset = adjustments.brightness * 2.55;
    nr = clamp(nr + bOffset);
    ng = clamp(ng + bOffset);
    nb = clamp(nb + bOffset);
  }

  // Contrast (-100 to 100)
  if (adjustments.contrast !== 0) {
    const factor = (259 * (adjustments.contrast + 255)) / (255 * (259 - adjustments.contrast));
    nr = clamp(factor * (nr - 128) + 128);
    ng = clamp(factor * (ng - 128) + 128);
    nb = clamp(factor * (nb - 128) + 128);
  }

  // Gamma (0.2 to 3.0)
  if (adjustments.gamma !== 1.0 && adjustments.gamma > 0) {
    const invGamma = 1.0 / adjustments.gamma;
    nr = clamp(255 * Math.pow(nr / 255, invGamma));
    ng = clamp(255 * Math.pow(ng / 255, invGamma));
    nb = clamp(255 * Math.pow(nb / 255, invGamma));
  }

  // Saturation (0 to 200)
  if (adjustments.saturation !== 100) {
    const gray = 0.299 * nr + 0.587 * ng + 0.114 * nb;
    const satFactor = adjustments.saturation / 100;
    nr = clamp(gray + (nr - gray) * satFactor);
    ng = clamp(gray + (ng - gray) * satFactor);
    nb = clamp(gray + (nb - gray) * satFactor);
  }

  return [nr, ng, nb];
}

export function processImageToDigits(
  sourceImage: HTMLImageElement | HTMLCanvasElement,
  palette: PalettePreset,
  ditherSettings: DitherSettings,
  adjustments: ImageAdjustments
): ProcessedResult {
  const startTime = performance.now();

  const srcWidth = sourceImage.width || 1;
  const srcHeight = sourceImage.height || 1;

  // Calculate target dimensions
  const targetW = Math.max(8, Math.min(320, Math.round(adjustments.width)));
  let targetH: number;

  if (adjustments.aspectRatioCompensation) {
    // Standard terminal/monospace text aspect ratio compensation (~0.55)
    // Characters are roughly twice as tall as they are wide.
    targetH = Math.max(4, Math.round(targetW * (srcHeight / srcWidth) * 0.55));
  } else {
    targetH = Math.max(4, Math.round(targetW * (srcHeight / srcWidth)));
  }

  // Render source to canvas to get pixel data
  const offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.width = targetW;
  offscreenCanvas.height = targetH;
  const ctx = offscreenCanvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error('Failed to get 2D rendering context');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(sourceImage, 0, 0, targetW, targetH);

  const imgData = ctx.getImageData(0, 0, targetW, targetH);
  const data = imgData.data;

  // Working 2D floating point buffers for R, G, B
  const rBuf: number[][] = Array.from({ length: targetH }, () => new Array(targetW).fill(0));
  const gBuf: number[][] = Array.from({ length: targetH }, () => new Array(targetW).fill(0));
  const bBuf: number[][] = Array.from({ length: targetH }, () => new Array(targetW).fill(0));

  // Pre-process initial pixel values
  for (let y = 0; y < targetH; y++) {
    for (let x = 0; x < targetW; x++) {
      const idx = (y * targetW + x) * 4;
      const [ar, ag, ab] = applyImageAdjustments(
        data[idx],
        data[idx + 1],
        data[idx + 2],
        adjustments
      );
      rBuf[y][x] = ar;
      gBuf[y][x] = ag;
      bBuf[y][x] = ab;
    }
  }

  const digits: string[][] = Array.from({ length: targetH }, () => new Array(targetW).fill('0'));
  const paletteIndices: number[][] = Array.from({ length: targetH }, () => new Array(targetW).fill(0));
  const pixelColors: RGBColor[][] = Array.from({ length: targetH }, () => new Array(targetW));

  const diffusionStrength = clamp(ditherSettings.errorDiffusionStrength, 0, 1);
  const algorithm = ditherSettings.algorithm;
  const isOrdered = algorithm.startsWith('bayer');

  // Handle Ordered Bayer Dithering
  if (isOrdered) {
    let matrix: number[][];
    let matrixSize = 4;

    if (algorithm === 'bayer-2x2') {
      matrix = BAYER_2X2;
      matrixSize = 2;
    } else if (algorithm === 'bayer-8x8') {
      matrix = BAYER_8X8;
      matrixSize = 8;
    } else {
      matrix = BAYER_4X4;
      matrixSize = 4;
    }

    // Step size between 8 color levels is roughly 255 / 7 = 36.4
    const thresholdSpread = 48 * diffusionStrength;

    for (let y = 0; y < targetH; y++) {
      for (let x = 0; x < targetW; x++) {
        const threshold = matrix[y % matrixSize][x % matrixSize] - 0.5;
        const offset = threshold * thresholdSpread;

        const r = clamp(rBuf[y][x] + offset);
        const g = clamp(gBuf[y][x] + offset);
        const b = clamp(bBuf[y][x] + offset);

        const colorIdx = findNearestColorIndex(
          r,
          g,
          b,
          palette.colors,
          ditherSettings.colorMatching
        );

        assignOutputPixel(
          x,
          y,
          colorIdx,
          palette,
          ditherSettings,
          digits,
          paletteIndices,
          pixelColors
        );
      }
    }
  } else if (algorithm === 'none') {
    // Nearest neighbor without dithering
    for (let y = 0; y < targetH; y++) {
      for (let x = 0; x < targetW; x++) {
        const r = clamp(rBuf[y][x]);
        const g = clamp(gBuf[y][x]);
        const b = clamp(bBuf[y][x]);

        const colorIdx = findNearestColorIndex(
          r,
          g,
          b,
          palette.colors,
          ditherSettings.colorMatching
        );

        assignOutputPixel(
          x,
          y,
          colorIdx,
          palette,
          ditherSettings,
          digits,
          paletteIndices,
          pixelColors
        );
      }
    }
  } else {
    // Error Diffusion Algorithms (Floyd-Steinberg, Atkinson, Sierra-2, Burkes)
    for (let y = 0; y < targetH; y++) {
      const isReverse = ditherSettings.serpentine && y % 2 === 1;
      const startX = isReverse ? targetW - 1 : 0;
      const endX = isReverse ? -1 : targetW;
      const stepX = isReverse ? -1 : 1;

      for (let x = startX; x !== endX; x += stepX) {
        const curR = clamp(rBuf[y][x]);
        const curG = clamp(gBuf[y][x]);
        const curB = clamp(bBuf[y][x]);

        const colorIdx = findNearestColorIndex(
          curR,
          curG,
          curB,
          palette.colors,
          ditherSettings.colorMatching
        );

        assignOutputPixel(
          x,
          y,
          colorIdx,
          palette,
          ditherSettings,
          digits,
          paletteIndices,
          pixelColors
        );

        const [chosenR, chosenG, chosenB] = palette.colors[colorIdx].rgb;
        const errR = (curR - chosenR) * diffusionStrength;
        const errG = (curG - chosenG) * diffusionStrength;
        const errB = (curB - chosenB) * diffusionStrength;

        // Distribute error to neighboring pixels
        if (algorithm === 'floyd-steinberg') {
          diffuseError(rBuf, gBuf, bBuf, targetW, targetH, x, y, stepX, [
            { dx: 1, dy: 0, weight: 7 / 16 },
            { dx: -1, dy: 1, weight: 3 / 16 },
            { dx: 0, dy: 1, weight: 5 / 16 },
            { dx: 1, dy: 1, weight: 1 / 16 },
          ], errR, errG, errB);
        } else if (algorithm === 'atkinson') {
          // Bill Atkinson: only diffuses 6/8 of error, leaving 2/8 (creates crisp borders)
          diffuseError(rBuf, gBuf, bBuf, targetW, targetH, x, y, stepX, [
            { dx: 1, dy: 0, weight: 1 / 8 },
            { dx: 2, dy: 0, weight: 1 / 8 },
            { dx: -1, dy: 1, weight: 1 / 8 },
            { dx: 0, dy: 1, weight: 1 / 8 },
            { dx: 1, dy: 1, weight: 1 / 8 },
            { dx: 0, dy: 2, weight: 1 / 8 },
          ], errR, errG, errB);
        } else if (algorithm === 'sierra-2') {
          diffuseError(rBuf, gBuf, bBuf, targetW, targetH, x, y, stepX, [
            { dx: 1, dy: 0, weight: 4 / 16 },
            { dx: 2, dy: 0, weight: 3 / 16 },
            { dx: -2, dy: 1, weight: 1 / 16 },
            { dx: -1, dy: 1, weight: 2 / 16 },
            { dx: 0, dy: 1, weight: 3 / 16 },
            { dx: 1, dy: 1, weight: 2 / 16 },
            { dx: 2, dy: 1, weight: 1 / 16 },
          ], errR, errG, errB);
        } else if (algorithm === 'burkes') {
          diffuseError(rBuf, gBuf, bBuf, targetW, targetH, x, y, stepX, [
            { dx: 1, dy: 0, weight: 8 / 32 },
            { dx: 2, dy: 0, weight: 4 / 32 },
            { dx: -2, dy: 1, weight: 2 / 32 },
            { dx: -1, dy: 1, weight: 4 / 32 },
            { dx: 0, dy: 1, weight: 8 / 32 },
            { dx: 1, dy: 1, weight: 4 / 32 },
            { dx: 2, dy: 1, weight: 2 / 32 },
          ], errR, errG, errB);
        }
      }
    }
  }

  const executionTimeMs = performance.now() - startTime;

  return {
    digits,
    paletteIndices,
    pixelColors,
    width: targetW,
    height: targetH,
    palette,
    executionTimeMs,
  };
}

interface DiffusionItem {
  dx: number;
  dy: number;
  weight: number;
}

function diffuseError(
  rBuf: number[][],
  gBuf: number[][],
  bBuf: number[][],
  width: number,
  height: number,
  x: number,
  y: number,
  stepX: number,
  kernel: DiffusionItem[],
  errR: number,
  errG: number,
  errB: number
) {
  for (let i = 0; i < kernel.length; i++) {
    const item = kernel[i];
    const targetX = x + item.dx * stepX;
    const targetY = y + item.dy;

    if (targetX >= 0 && targetX < width && targetY >= 0 && targetY < height) {
      rBuf[targetY][targetX] += errR * item.weight;
      gBuf[targetY][targetX] += errG * item.weight;
      bBuf[targetY][targetX] += errB * item.weight;
    }
  }
}

function assignOutputPixel(
  x: number,
  y: number,
  colorIdx: number,
  palette: PalettePreset,
  ditherSettings: DitherSettings,
  digits: string[][],
  paletteIndices: number[][],
  pixelColors: RGBColor[][]
) {
  paletteIndices[y][x] = colorIdx;

  const [pr, pg, pb] = palette.colors[colorIdx].rgb;
  pixelColors[y][x] = { r: pr, g: pg, b: pb };

  // Resolve digit character
  let glyphIdx = colorIdx;
  if (ditherSettings.invertDigits) {
    glyphIdx = 7 - colorIdx;
  }

  const customDigits = ditherSettings.customDigits;
  const char =
    customDigits && customDigits[glyphIdx] !== undefined
      ? customDigits[glyphIdx]
      : palette.colors[glyphIdx]?.digit || String(glyphIdx);

  digits[y][x] = char;
}
