/**
 * Utility per garantire la visibilità dei colori su sfondo chiaro.
 *
 * Il problema: i colori hex_color dei profili aromatici (es. giallo pallido, crema)
 * possono essere invisibili come icone, barre o testo su sfondo bianco/ivory.
 *
 * La soluzione: scurire automaticamente i colori troppo chiari.
 */

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

/**
 * Calcola la luminosità percepita (0-255).
 * Formula W3C: https://www.w3.org/TR/AERT/#color-contrast
 */
const perceivedBrightness = (r: number, g: number, b: number): number =>
  (r * 299 + g * 587 + b * 114) / 1000;

/**
 * Scurisce un colore di una certa percentuale (0-1).
 */
const darken = (r: number, g: number, b: number, amount: number) => ({
  r: r * (1 - amount),
  g: g * (1 - amount),
  b: b * (1 - amount),
});

/**
 * Restituisce una versione del colore garantita visibile su sfondo chiaro.
 *
 * Se la luminosità percepita è sopra la soglia (default: 180),
 * scurisce il colore progressivamente fino a renderlo leggibile.
 *
 * @param hex - Colore in formato #RRGGBB
 * @param threshold - Soglia di luminosità (default: 180, range 0-255)
 * @returns Colore hex scurito se necessario, altrimenti invariato
 */
export const ensureVisible = (hex: string | null | undefined, threshold = 180): string => {
  if (!hex) return '#78716c'; // stone-500 come fallback

  const rgb = hexToRgb(hex);
  if (!rgb) return '#78716c';

  const brightness = perceivedBrightness(rgb.r, rgb.g, rgb.b);

  if (brightness <= threshold) return hex; // già visibile

  // Scurisci progressivamente: più è chiaro, più scurisci
  const excess = (brightness - threshold) / (255 - threshold); // 0-1
  const darkenAmount = 0.3 + excess * 0.35; // tra 30% e 65%

  const darkened = darken(rgb.r, rgb.g, rgb.b, darkenAmount);
  return rgbToHex(darkened.r, darkened.g, darkened.b);
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