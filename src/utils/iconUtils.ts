/**
 * Icon resolver per i profili aromatici.
 *
 * NOTA: l'import wildcard `import * as Icons` impedisce il tree-shaking
 * e carica tutte le ~1500 icone Lucide nel bundle.
 *
 * TODO: sostituire con un mapping esplicito delle icone effettivamente usate
 * per ridurre il bundle di ~200-300KB. Esempio:
 *
 *   const ICON_MAP: Record<string, LucideIcon> = {
 *     Apple, Flower2, Flame, Milk, Leaf, Nut, Candy, Trees, Search
 *   };
 */
import { type LucideIcon } from 'lucide-react';
import {
  Search, Apple, Flower2, Flame, Milk, Leaf, Nut, Candy, Trees
} from 'lucide-react';
import * as AllIcons from 'lucide-react';

const GROUP_FALLBACKS: Array<[RegExp, LucideIcon]> = [
  [/frutt|berry|fruit/i, Apple],
  [/flor|flower|rose/i, Flower2],
  [/spec|spice|tost/i, Flame],
  [/latt|milk|crem/i, Milk],
  [/erba|grass|leaf/i, Leaf],
  [/nocc|nut|mandorl/i, Nut],
  [/dolc|sugar|honey/i, Candy],
  [/bosc|wood|pin|oak/i, Trees],
];

/**
 * Risolve un'icona Lucide dato uno slug e/o un nome di gruppo.
 * Fallback: Search icon.
 */
export const getIconHelper = (slug: string | null, group?: string): LucideIcon => {
  if (!slug && !group) return Search;

  // 1. Prova il nome PascalCase diretto dallo slug
  if (slug) {
    const pascal = slug
      .split(/[-_]/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join('');

    const DirectIcon = (AllIcons as Record<string, unknown>)[pascal];
    if (typeof DirectIcon === 'function') return DirectIcon as LucideIcon;
  }

  // 2. Fallback per gruppo/slug tramite pattern matching
  const combined = `${slug || ''} ${group || ''}`.toLowerCase();
  for (const [pattern, icon] of GROUP_FALLBACKS) {
    if (pattern.test(combined)) return icon;
  }

  return Search;
};