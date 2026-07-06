/**
 * Generates all WHOIAM brand assets (app icon, splash, favicon, Android
 * adaptive icons) from one SVG mark, so branding stays consistent and
 * tweakable in code.
 *
 * The mark: a single continuous "W" stroke whose final upstroke rises past
 * the others toward a floating point of light — the person you're becoming.
 *
 * Run with: npm run brand:generate
 */
import sharp from 'sharp';
import { Buffer } from 'node:buffer';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const out = join(dirname(fileURLToPath(import.meta.url)), '../assets/images');
mkdirSync(out, { recursive: true });

// Icon background: dusty blue drifting into sage green, muted and calm.
const BG_TOP = '#64809A';
const BG_BOTTOM = '#7C9781';
const IVORY = '#F7F6F3';

/** The W-and-rising-point mark, centered in a 1024 viewBox. */
function mark(color = IVORY) {
  return `
    <g stroke="${color}" stroke-width="66" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <polyline points="292,402 386,646 492,446 598,646 716,362" />
    </g>
    <circle cx="742" cy="272" r="30" fill="${color}" />
  `;
}

function gradientDefs() {
  return `
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0.6" y2="1">
        <stop offset="0" stop-color="${BG_TOP}" />
        <stop offset="1" stop-color="${BG_BOTTOM}" />
      </linearGradient>
    </defs>
  `;
}

const svg = {
  /** Full-bleed square app icon (iOS masks its own corners). */
  icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
    ${gradientDefs()}
    <rect width="1024" height="1024" fill="url(#bg)" />
    ${mark()}
  </svg>`,

  /** Mark only, transparent — splash image and Android foreground/monochrome. */
  markOnly: (color = IVORY) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
    ${mark(color)}
  </svg>`,

  background: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
    ${gradientDefs()}
    <rect width="1024" height="1024" fill="url(#bg)" />
  </svg>`,
};

async function render(svgString, size, file, { pad = 0 } = {}) {
  const inner = size - pad * 2;
  let img = sharp(Buffer.from(svgString), { density: 300 }).resize(inner, inner);
  if (pad > 0) {
    img = sharp(await img.png().toBuffer()).extend({
      top: pad,
      bottom: pad,
      left: pad,
      right: pad,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    });
  }
  await img.png().toFile(join(out, file));
  console.log(`wrote assets/images/${file}`);
}

await render(svg.icon, 1024, 'icon.png');
await render(svg.markOnly(), 512, 'splash-icon.png');
await render(svg.icon, 48, 'favicon.png');
// Android adaptive: mark inside the 66% safe zone of a 432px canvas.
await render(svg.markOnly(), 432, 'android-icon-foreground.png', { pad: 76 });
await render(svg.background, 432, 'android-icon-background.png');
await render(svg.markOnly('#FFFFFF'), 432, 'android-icon-monochrome.png', { pad: 76 });

console.log('done');
