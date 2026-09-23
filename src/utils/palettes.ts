import { PalettePreset } from '../types';

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function hexToRgb(hex: string): [number, number, number] {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) return [0, 0, 0];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

export const PALETTE_PRESETS: PalettePreset[] = [
  {
    id: '3bit-rgb-standard',
    name: '3-Bit RGB Standard',
    description: 'Fundamental 3-bit color cube (RGB 0/255 combinations: 000 to 111)',
    colors: [
      { digit: '0', name: 'Black', rgb: [0, 0, 0], hex: '#000000' },
      { digit: '1', name: 'Blue', rgb: [0, 0, 255], hex: '#0000ff' },
      { digit: '2', name: 'Green', rgb: [0, 255, 0], hex: '#00ff00' },
      { digit: '3', name: 'Cyan', rgb: [0, 255, 255], hex: '#00ffff' },
      { digit: '4', name: 'Red', rgb: [255, 0, 0], hex: '#ff0000' },
      { digit: '5', name: 'Magenta', rgb: [255, 0, 255], hex: '#ff00ff' },
      { digit: '6', name: 'Yellow', rgb: [255, 255, 0], hex: '#ffff00' },
      { digit: '7', name: 'White', rgb: [255, 255, 255], hex: '#ffffff' },
    ],
  },
  {
    id: '3bit-grayscale',
    name: '3-Bit Grayscale',
    description: '8 uniform luminance steps (0=black to 7=white, 32-step quantization)',
    colors: [
      { digit: '0', name: 'Black', rgb: [0, 0, 0], hex: '#000000' },
      { digit: '1', name: 'Charcoal', rgb: [36, 36, 36], hex: '#242424' },
      { digit: '2', name: 'Dark Slate', rgb: [73, 73, 73], hex: '#494949' },
      { digit: '3', name: 'Dim Gray', rgb: [109, 109, 109], hex: '#6d6d6d' },
      { digit: '4', name: 'Medium Gray', rgb: [146, 146, 146], hex: '#929292' },
      { digit: '5', name: 'Silver', rgb: [182, 182, 182], hex: '#b6b6b6' },
      { digit: '6', name: 'Light Gray', rgb: [219, 219, 219], hex: '#dbdbdb' },
      { digit: '7', name: 'Pure White', rgb: [255, 255, 255], hex: '#ffffff' },
    ],
  },
  {
    id: '3bit-cga-retro',
    name: 'CGA 8-Color Retro',
    description: 'Authentic 1981 IBM PC low-intensity 8-color hardware palette',
    colors: [
      { digit: '0', name: 'Black', rgb: [0, 0, 0], hex: '#000000' },
      { digit: '1', name: 'CGA Blue', rgb: [0, 0, 170], hex: '#0000aa' },
      { digit: '2', name: 'CGA Green', rgb: [0, 170, 0], hex: '#00aa00' },
      { digit: '3', name: 'CGA Cyan', rgb: [0, 170, 170], hex: '#00aaaa' },
      { digit: '4', name: 'CGA Red', rgb: [170, 0, 0], hex: '#aa0000' },
      { digit: '5', name: 'CGA Magenta', rgb: [170, 0, 170], hex: '#aa00aa' },
      { digit: '6', name: 'CGA Brown', rgb: [170, 85, 0], hex: '#aa5500' },
      { digit: '7', name: 'Light Gray', rgb: [170, 170, 170], hex: '#aaaaaa' },
    ],
  },
  {
    id: '3bit-zx-spectrum',
    name: 'Sinclair ZX Spectrum',
    description: 'Iconic 1982 8-color British home computer standard ink set',
    colors: [
      { digit: '0', name: 'Black', rgb: [0, 0, 0], hex: '#000000' },
      { digit: '1', name: 'Spec Blue', rgb: [0, 34, 192], hex: '#0022c0' },
      { digit: '2', name: 'Spec Red', rgb: [216, 32, 32], hex: '#d82020' },
      { digit: '3', name: 'Spec Magenta', rgb: [216, 32, 216], hex: '#d820d8' },
      { digit: '4', name: 'Spec Green', rgb: [0, 204, 34], hex: '#00cc22' },
      { digit: '5', name: 'Spec Cyan', rgb: [0, 204, 216], hex: '#00ccd8' },
      { digit: '6', name: 'Spec Yellow', rgb: [216, 204, 34], hex: '#d8cc22' },
      { digit: '7', name: 'Spec White', rgb: [255, 255, 255], hex: '#ffffff' },
    ],
  },
  {
    id: '3bit-amber-crt',
    name: 'Amber Phosphor CRT',
    description: '8 warm shades simulating a vintage amber CRT terminal display',
    colors: [
      { digit: '0', name: 'Black Oxide', rgb: [18, 10, 0], hex: '#120a00' },
      { digit: '1', name: 'Deep Ochre', rgb: [56, 32, 0], hex: '#382000' },
      { digit: '2', name: 'Dark Rust', rgb: [98, 54, 0], hex: '#623600' },
      { digit: '3', name: 'Amber Glow 1', rgb: [142, 80, 0], hex: '#8e5000' },
      { digit: '4', name: 'Amber Glow 2', rgb: [188, 110, 0], hex: '#bc6e00' },
      { digit: '5', name: 'Golden Amber', rgb: [224, 142, 10], hex: '#e08e0a' },
      { digit: '6', name: 'Bright Amber', rgb: [255, 176, 20], hex: '#ffb014' },
      { digit: '7', name: 'Peak Amber Phosphor', rgb: [255, 218, 110], hex: '#ffda6e' },
    ],
  },
  {
    id: '3bit-green-crt',
    name: 'Phosphor Green Terminal',
    description: '8 glowing green luminance steps of classic P1 phosphor monitors',
    colors: [
      { digit: '0', name: 'Pitch Dark', rgb: [4, 16, 6], hex: '#041006' },
      { digit: '1', name: 'Dim Phosphor', rgb: [10, 42, 15], hex: '#0a2a0f' },
      { digit: '2', name: 'Dark Green', rgb: [18, 76, 26], hex: '#124c1a' },
      { digit: '3', name: 'Terminal Green 1', rgb: [28, 118, 40], hex: '#1c7628' },
      { digit: '4', name: 'Terminal Green 2', rgb: [40, 164, 56], hex: '#28a438' },
      { digit: '5', name: 'Radiant Green', rgb: [52, 210, 72], hex: '#34d248' },
      { digit: '6', name: 'Neon Phosphor', rgb: [72, 245, 96], hex: '#48f560' },
      { digit: '7', name: 'Peak Phosphor White', rgb: [170, 255, 185], hex: '#aaffb9' },
    ],
  },
  {
    id: '3bit-cyberpunk',
    name: 'Cyberpunk Synthwave',
    description: '8 punchy synthwave neon colors (cyan, magenta, electric violet, gold)',
    colors: [
      { digit: '0', name: 'Abyss Navy', rgb: [10, 10, 28], hex: '#0a0a1c' },
      { digit: '1', name: 'Electric Indigo', rgb: [78, 20, 140], hex: '#4e148c' },
      { digit: '2', name: 'Neon Violet', rgb: [133, 14, 214], hex: '#850ed6' },
      { digit: '3', name: 'Hot Magenta', rgb: [247, 37, 133], hex: '#f72585' },
      { digit: '4', name: 'Laser Blue', rgb: [67, 97, 238], hex: '#4361ee' },
      { digit: '5', name: 'Cyan Glow', rgb: [76, 201, 240], hex: '#4cc9f0' },
      { digit: '6', name: 'Synth Yellow', rgb: [254, 228, 64], hex: '#fee440' },
      { digit: '7', name: 'Neon White', rgb: [250, 252, 255], hex: '#fafcff' },
    ],
  },
];
