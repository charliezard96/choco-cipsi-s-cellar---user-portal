import { Chocolate, Producer } from '../types';

/**
 * Verifica se un cioccolato appartiene a un produttore.
 * Centralizza la logica di matching che prima era duplicata 3+ volte in App.tsx.
 *
 * Priorità:
 *   1. Match per ID (se il cioccolato ha un producerId)
 *   2. Match per nome (case-insensitive, bidirezionale con includes)
 */
export const isChocolateByProducer = (c: Chocolate, p: Producer): boolean => {
  // Match esatto per ID
  if (c.producerId && c.producerId === p.id) return true;

  // Fallback: match per nome
  if (c.producerId) return false; // Ha un ID ma non corrisponde — non è questo produttore

  const cName = c.producer.toLowerCase().trim();
  const pName = p.name.toLowerCase().trim();

  return cName === pName || cName.includes(pName) || pName.includes(cName);
};

/**
 * Trova il produttore associato a un cioccolato.
 */
export const findProducerForChocolate = (
  chocolate: Chocolate,
  producers: Producer[]
): Producer | undefined => {
  return producers.find(p => isChocolateByProducer(chocolate, p));
};

/**
 * Filtra i cioccolati di un produttore specifico.
 */
export const getChocolatesByProducer = (
  producer: Producer,
  chocolates: Chocolate[]
): Chocolate[] => {
  return chocolates.filter(c => isChocolateByProducer(c, producer));
};