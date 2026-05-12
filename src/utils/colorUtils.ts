/** Converte hex (#RRGGBB) in { r, g, b } */
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return null;
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
};

/** Converte { r, g, b } in hex (#RRGGBB) */
const rgbToHex = (r: number, g: number, b: number): string =>
  '#' + [r, g, b].map(c => Math.round(c).toString(16).padStart(2, '0')).join('');

/** Calcola la luminosità percepita (0-255). Formula W3C */
const perceivedBrightness = (r: number, g: number, b: number): number =>
  (r * 299 + g * 587 + b * 114) / 1000;

/** Converte RGB (0-255) in HSL (h: 0-360, s: 0-100, l: 0-100) */
const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: l * 100 };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  switch (max) {
    case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6; break;
    case gn: h = ((bn - rn) / d + 2) / 6; break;
    default:  h = ((rn - gn) / d + 4) / 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
};

/** Converte HSL (h: 0-360, s: 0-100, l: 0-100) in hex */
const hslToHex = (h: number, s: number, l: number): string => {
  const hn = h / 360, sn = s / 100, ln = l / 100;
  const hue2rgb = (p: number, q: number, t: number) => {
    const tt = ((t % 1) + 1) % 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  if (sn === 0) return rgbToHex(ln * 255, ln * 255, ln * 255);
  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;
  return rgbToHex(hue2rgb(p, q, hn + 1 / 3) * 255, hue2rgb(p, q, hn) * 255, hue2rgb(p, q, hn - 1 / 3) * 255);
};

/**
 * Restituisce una versione del colore garantita visibile su sfondo chiaro.
 * Usa HSL per preservare il colore (hue) mentre scurisce e satura.
 * Colori chiari/pastello mantengono identità cromatica invece di diventare grigi.
 */
export const ensureVisible = (hex: string | null | undefined, threshold = 180): string => {
  if (!hex) return '#78716c';
  const rgb = hexToRgb(hex);
  if (!rgb) return '#78716c';

  const brightness = perceivedBrightness(rgb.r, rgb.g, rgb.b);
  if (brightness <= threshold) return hex;

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  // Colore acromatico (grigio/bianco): fallback neutro
  if (hsl.s < 5) return '#78716c';

  // Clamp lightness ≤ 38% e boost saturation ≥ 60% per mantenere hue leggibile
  const targetL = Math.min(hsl.l, 38);
  const targetS = Math.max(hsl.s, 60);
  return hslToHex(hsl.h, targetS, targetL);
};

/**
 * Restituisce il colore originale per gli sfondi (con opacità bassa va bene chiaro)
 * e una versione scurita per icone/testo/barre.
 *
 * Uso tipico:
 *   const { bg, fg } = getAromaColors(profile.hex_color);
 *   style={{ backgroundColor: bg, color: fg }}
 */
export const getAromaColors = (hex: string | null | undefined) => ({
  /** Colore per sfondi (originale con opacità, sempre ok) */
  bg: hex ? `${hex}20` : '#f3f4f620',
  /** Colore per bordi (leggermente più visibile dello sfondo) */
  border: hex ? `${hex}50` : '#e5e7eb',
  /** Colore per icone, testo e barre (scurito se necessario) */
  fg: ensureVisible(hex),
});