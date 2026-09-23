export interface SamplePreset {
  id: string;
  name: string;
  description: string;
  url: string;
  recommendedPalette?: string;
  recommendedWidth?: number;
}

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: 'sculpture',
    name: 'Marble Sculpture',
    description: 'Chiaroscuro classical bust ideal for testing grayscale & dithering gradients',
    url: '/src/assets/images/sample_sculpture_bust_1790124117290.jpg',
    recommendedPalette: '3bit-grayscale',
    recommendedWidth: 64,
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Pilot',
    description: 'Neon rim-lit visor character ideal for vibrant 3-bit RGB & Cyberpunk palettes',
    url: '/src/assets/images/sample_retro_cyber_1790124132055.jpg',
    recommendedPalette: '3bit-cyberpunk',
    recommendedWidth: 64,
  },
  {
    id: 'mountain',
    name: 'Mountain Summit',
    description: 'High contrast peak silhouette with dramatic sky and water reflection',
    url: '/src/assets/images/sample_mountain_peak_1790124141488.jpg',
    recommendedPalette: '3bit-rgb-standard',
    recommendedWidth: 72,
  },
];

// Generates an 8-color gradient test card data URL
export function generateTestPatternDataUrl(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Draw 8 vertical color bars on top half
  const colors = [
    '#000000', '#0000ff', '#00ff00', '#00ffff',
    '#ff0000', '#ff00ff', '#ffff00', '#ffffff',
  ];
  const barWidth = 128 / colors.length;
  for (let i = 0; i < colors.length; i++) {
    ctx.fillStyle = colors[i];
    ctx.fillRect(i * barWidth, 0, barWidth, 64);
  }

  // Draw smooth gradients on bottom half
  const grad = ctx.createLinearGradient(0, 64, 128, 64);
  grad.addColorStop(0, '#000000');
  grad.addColorStop(0.2, '#ff0000');
  grad.addColorStop(0.4, '#ffff00');
  grad.addColorStop(0.6, '#00ff00');
  grad.addColorStop(0.8, '#00ffff');
  grad.addColorStop(1, '#ffffff');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 64, 128, 32);

  // Smooth black-to-white gradient
  const grayGrad = ctx.createLinearGradient(0, 96, 128, 96);
  grayGrad.addColorStop(0, '#000000');
  grayGrad.addColorStop(1, '#ffffff');
  ctx.fillStyle = grayGrad;
  ctx.fillRect(0, 96, 128, 32);

  return canvas.toDataURL('image/png');
}
