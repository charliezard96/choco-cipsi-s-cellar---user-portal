import React, { useState, useMemo } from 'react';
import { Producer } from '../types';
import { ArrowRight, Search } from 'lucide-react';
import { getCountryCode } from '../lib/countryUtils';

interface Props {
  producers: Producer[];
  loading: boolean;
  onSelectProducer: (id: string) => void;
}

export const ProducersView: React.FC<Props> = ({ producers, loading, onSelectProducer }) => {
  const [selectedOrigin, setSelectedOrigin] = useState('All');
  const [search, setSearch] = useState('');

  const origins = useMemo(() => Array.from(new Set(producers.map(p => p.location))).sort(), [producers]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return producers.filter(p => {
      const matchesOrigin = selectedOrigin === 'All' || p.location === selectedOrigin;
      const matchesSearch = !term || p.name.toLowerCase().includes(term) || p.location.toLowerCase().includes(term);
      return matchesOrigin && matchesSearch;
    });
  }, [producers, selectedOrigin, search]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700">
      <header className="mb-16">
        <h1 className="text-5xl font-bold text-primary mb-4">Produttori Bean-to-Bar</h1>
        <p className="text-lg text-on-surface-variant max-w-2xl leading-relaxed">
          Una guida curata dei più illustri produttori di cioccolato al mondo, dedicati alla preservazione del terroir e della metodologia artigianale.
        </p>
      </header>

      <div className="flex flex-col md:flex-row items-end gap-6 mb-12 pb-6 border-b border-primary/10">
        <div className="flex-grow w-full">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-2 block">Cerca Produttori</label>
          <div className="relative">
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cerca per nome o località del produttore..."
              className="w-full bg-white border border-primary/20 rounded-lg px-4 py-3 focus:border-secondary transition-all outline-none" />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 w-5 h-5" />
          </div>
        </div>
        <div className="w-full md:w-64">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-2 block">Filtra per Origine</label>
          <select value={selectedOrigin} onChange={e => setSelectedOrigin(e.target.value)}
            className="w-full bg-white border border-primary/20 rounded-lg px-4 py-3 appearance-none cursor-pointer">
            <option value="All">Tutte le origini</option>
            {origins.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {filtered.map(producer => (
          <div key={producer.id} onClick={() => onSelectProducer(producer.id)}
            className="bg-white p-8 border border-primary/10 hover:border-secondary/40 transition-all group flex flex-col gap-6 cursor-pointer h-full">
            <div className="w-full aspect-[3/2] overflow-hidden bg-surface-container shrink-0 shadow-sm border border-primary/5">
              <img src={`https://flagcdn.com/w640/${getCountryCode(producer.location)}.png`}
                className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                alt={producer.location} loading="lazy" />
            </div>
            <div className="flex flex-col flex-1">
              <div className="flex items-center gap-3 mb-3">
                {producer.logoUrl && (
                  <div className="w-10 h-10 bg-white p-1.5 rounded shadow-sm border border-primary/5 flex items-center justify-center shrink-0">
                    <img src={producer.logoUrl} className="max-w-full max-h-full object-contain" alt="" />
                  </div>
                )}
                <span className="text-[10px] text-secondary uppercase tracking-[0.2em] font-bold block">{producer.location}</span>
              </div>
              <h3 className="text-3xl text-primary font-bold mb-4 tracking-tight">{producer.name}</h3>
              <p className="text-sm text-on-surface-variant flex-1 leading-relaxed mb-6 line-clamp-3 italic">{producer.description}</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {producer.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="bg-surface-container px-3 py-1 text-[8px] font-bold rounded-full uppercase tracking-wider">{tag}</span>
                ))}
              </div>
              <div className="pt-4 border-t border-primary/5 flex justify-between items-center text-primary group-hover:text-secondary transition-colors">
                <span className="text-[10px] font-bold uppercase tracking-widest">Esplora il Produttore</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 bg-surface-container-low rounded-xl border border-dashed border-primary/20">
          <p className="text-on-surface-variant font-medium">Nessun produttore corrisponde ai criteri di ricerca.</p>
          <button onClick={() => { setSearch(''); setSelectedOrigin('All'); }} className="mt-4 text-secondary font-bold text-xs uppercase tracking-widest underline">Resetta Filtri</button>
        </div>
      )}
    </div>
  );
};