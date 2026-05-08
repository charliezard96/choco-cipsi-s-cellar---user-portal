/**
 * Mappa location → codice paese ISO 3166-1 alpha-2.
 * Refactored: oggetto di lookup invece di 70+ if-else.
 */
const COUNTRY_MAP: Record<string, string> = {
  // Americas
  usa: 'us', 'united states': 'us', 'stati uniti': 'us',
  brazil: 'br', brasile: 'br',
  canada: 'ca',
  colombia: 'co',
  peru: 'pe', perù: 'pe',
  ecuador: 'ec',
  venezuela: 've',
  mexico: 'mx', messico: 'mx',
  bolivia: 'bo',
  'costa rica': 'cr',
  guatemala: 'gt',
  honduras: 'hn',
  nicaragua: 'ni',
  'el salvador': 'sv',
  panama: 'pa',
  belize: 'bz',
  trinidad: 'tt',
  grenada: 'gd',
  jamaica: 'jm', giamaica: 'jm',
  haiti: 'ht',
  cuba: 'cu',
  'dominican': 'do', 'repubblica dominicana': 'do',
  'st lucia': 'lc', 'saint lucia': 'lc', 'santa lucia': 'lc',

  // Europe
  italy: 'it', italia: 'it',
  france: 'fr', francia: 'fr',
  spain: 'es', spagna: 'es',
  portugal: 'pt', portogallo: 'pt',
  germany: 'de', germania: 'de',
  austria: 'at',
  switzerland: 'ch', svizzera: 'ch',
  uk: 'gb', 'united kingdom': 'gb', 'regno unito': 'gb', inghilterra: 'gb', scotland: 'gb', scozia: 'gb',
  holland: 'nl', netherlands: 'nl', olanda: 'nl', 'paesi bassi': 'nl',
  belgium: 'be', belgio: 'be',
  sweden: 'se', svezia: 'se',
  denmark: 'dk', danimarca: 'dk',
  norway: 'no', norvegia: 'no',
  finland: 'fi', finlandia: 'fi',
  iceland: 'is', islanda: 'is',
  poland: 'pl', polonia: 'pl',
  hungary: 'hu', ungheria: 'hu',
  czech: 'cz',
  lithuania: 'lt', lituania: 'lt',

  // Africa
  madagascar: 'mg',
  tanzania: 'tz',
  ghana: 'gh',
  'ivory coast': 'ci', "costa d'avorio": 'ci',
  cameroon: 'cm', camerun: 'cm',
  uganda: 'ug',
  nigeria: 'ng',
  liberia: 'lr',
  togo: 'tg',
  benin: 'bj',
  'sao tome': 'st',
  congo: 'cg',
  mali: 'ml',
  ethiopia: 'et', etiopia: 'et',
  'south africa': 'za', sudafrica: 'za',

  // Asia & Oceania
  vietnam: 'vn',
  philippines: 'ph', filippine: 'ph',
  taiwan: 'tw',
  japan: 'jp', giappone: 'jp',
  india: 'in',
  indonesia: 'id',
  malaysia: 'my',
  thailand: 'th', thailandia: 'th',
  'sri lanka': 'lk',
  singapore: 'sg',
  australia: 'au',
  'new zealand': 'nz', 'nuova zelanda': 'nz',
  'solomon islands': 'sb', 'isole salomone': 'sb',
  vanuatu: 'vu',
  fiji: 'fj',
  'papua new guinea': 'pg',
};

export const getCountryCode = (location: string): string => {
  const lower = location.toLowerCase().trim();

  // 1. Exact match
  if (COUNTRY_MAP[lower]) return COUNTRY_MAP[lower];

  // 2. Substring match (handles "São Tomé e Príncipe", "United Kingdom of...", etc.)
  for (const [key, code] of Object.entries(COUNTRY_MAP)) {
    if (lower.includes(key)) return code;
  }

  return 'un'; // fallback: United Nations flag
};