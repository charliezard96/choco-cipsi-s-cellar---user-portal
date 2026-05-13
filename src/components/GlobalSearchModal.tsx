import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Chocolate, Producer } from '../types';
import { useSearch } from '../contexts/SearchContext';

interface Props {
  chocolates: Chocolate[];
  producers: Producer[];
}

export const GlobalSearchModal: React.FC<Props> = ({ chocolates, producers }) => {
  const { isOpen, closeSearch } = useSearch();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSearch();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); isOpen ? closeSearch() : null; }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, closeSearch]);

  const term = query.toLowerCase().trim();
  const matchedChocolates = term.length < 2 ? [] : chocolates
    .filter(c => c.name.toLowerCase().includes(term) || c.producer.toLowerCase().includes(term) || c.origin.toLowerCase().includes(term))
    .slice(0, 5);
  const matchedProducers = term.length < 2 ? [] : producers
    .filter(p => p.name.toLowerCase().includes(term) || p.location.toLowerCase().includes(term))
    .slice(0, 3);

  const go = (path: string) => { navigate(path); closeSearch(); };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 px-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeSearch} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.96, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Input */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-stone-100">
              <Search size={18} className="text-stone-400 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Cerca tavolette, produttori, origini..."
                className="flex-1 text-sm font-medium text-primary outline-none placeholder:text-stone-300"
              />
              <button onClick={closeSearch} className="p-1 hover:bg-stone-100 rounded-full text-stone-400">
                <X size={16} />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {term.length < 2 ? (
                <div className="py-12 text-center">
                  <p className="text-xs text-stone-300 font-bold uppercase tracking-widest">Digita per cercare</p>
                </div>
              ) : matchedChocolates.length === 0 && matchedProducers.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-xs text-stone-300 font-bold uppercase tracking-widest">Nessun risultato per "{query}"</p>
                </div>
              ) : (
                <div className="p-3">
                  {matchedChocolates.length > 0 && (
                    <div className="mb-4">
                      <p className="text-[9px] font-black text-stone-300 uppercase tracking-widest px-3 mb-2">Tavolette</p>
                      {matchedChocolates.map(c => (
                        <button key={c.id} onClick={() => go(`/chocolate/${c.slug}`)}
                          className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-stone-50 transition-colors text-left group">
                          <img src={c.imageUrl} alt={c.name} className="w-10 h-10 rounded-xl object-cover bg-stone-100 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="text-[9px] font-black text-secondary uppercase tracking-widest block">{c.producer}</span>
                            <span className="text-sm font-bold text-primary truncate block">{c.name}</span>
                            <span className="text-[10px] text-stone-400 italic">{c.origin}</span>
                          </div>
                          <ArrowRight size={14} className="text-stone-300 group-hover:text-secondary transition-colors shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                  {matchedProducers.length > 0 && (
                    <div>
                      <p className="text-[9px] font-black text-stone-300 uppercase tracking-widest px-3 mb-2">Produttori</p>
                      {matchedProducers.map(p => (
                        <button key={p.id} onClick={() => go(`/producers/${p.id}`)}
                          className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-stone-50 transition-colors text-left group">
                          {p.logoUrl
                            ? <img src={p.logoUrl} alt={p.name} className="w-10 h-10 rounded-xl object-contain bg-stone-50 border border-stone-100 shrink-0 p-1" />
                            : <div className="w-10 h-10 rounded-xl bg-stone-100 shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-bold text-primary truncate block">{p.name}</span>
                            <span className="text-[10px] text-stone-400">{p.location}</span>
                          </div>
                          <ArrowRight size={14} className="text-stone-300 group-hover:text-secondary transition-colors shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div className="px-6 py-3 border-t border-stone-50 flex items-center justify-between">
              <span className="text-[9px] text-stone-300 font-bold uppercase tracking-widest">ESC per chiudere</span>
              <span className="text-[9px] text-stone-300 font-bold uppercase tracking-widest">↵ per aprire</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
