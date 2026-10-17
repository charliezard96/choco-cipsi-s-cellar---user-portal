/**
 * Dati legali del sito, usati dall'informativa privacy.
 * Aggiornare qui (e LAST_UPDATED) quando cambiano titolare o fornitori.
 */

export const DATA_CONTROLLER = {
  name: 'Carlo Alberto Bernardini',
  email: 'decacao.privacy@gmail.com',
} as const;

export const PRIVACY_PATH = '/privacy';

/** Data dell'ultima revisione dell'informativa (ISO 8601). */
export const PRIVACY_LAST_UPDATED = '2026-10-17';

export interface DataProcessor {
  name: string;
  purpose: string;
  privacyUrl: string;
}

/** Servizi di terze parti che trattano dati dei visitatori per conto del sito. */
export const DATA_PROCESSORS: readonly DataProcessor[] = [
  {
    name: 'Supabase',
    purpose: 'Database, autenticazione, invio delle email di servizio (conferma account, recupero password) e archiviazione delle immagini del profilo.',
    privacyUrl: 'https://supabase.com/privacy',
  },
  {
    name: 'Vercel',
    purpose: 'Hosting del sito: riceve le richieste del browser e registra dati tecnici (indirizzo IP, browser) nei log di sicurezza.',
    privacyUrl: 'https://vercel.com/legal/privacy-policy',
  },
  {
    name: 'Google',
    purpose: 'Solo se scegli "Accedi con Google": ci comunica nome, email e foto del tuo account Google.',
    privacyUrl: 'https://policies.google.com/privacy',
  },
  {
    name: 'Unsplash',
    purpose: 'Fornisce alcune immagini decorative: il tuo browser le scarica direttamente dai loro server.',
    privacyUrl: 'https://unsplash.com/privacy',
  },
  {
    name: 'Flagpedia (flagcdn.com)',
    purpose: 'Fornisce le immagini delle bandiere dei paesi: il tuo browser le scarica direttamente dai loro server.',
    privacyUrl: 'https://flagpedia.net/about',
  },
];
