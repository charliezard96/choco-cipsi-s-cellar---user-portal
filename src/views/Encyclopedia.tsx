import React, { useState, useMemo } from 'react';
import { Chocolate } from '../types';
import { ChocolateCard } from '../components/ChocolateCard';
import { Search, Loader2 } from 'lucide-react';

interface Props {
  onSelect: (id: string) => void;
  chocolates: Chocolate[];
  loading: boolean;
}

export const EncyclopediaView: React.FC<Props> = ({ onSelect, chocolates, loading }) => {
  const [search, setSearch] = useState('');
  const [selectedOrigin, setSelectedOrigin] = useState('All');
  const [selectedNote, setSelectedNote] = useState('All');
  const [selectedPercentage, setSelectedPercentage] = useState('All');

  const origins = useMemo(() => Array.from(new Set(chocolates.map(c => c.origin))).sort(), [chocolates]);
  const notes = useMemo(() => Array.from(new Set(chocolates.flatMap(c => c.tastingNotes))).sort(), [chocolates]);
  const percentages = useMemo(
    () => Array.from(new Set(chocolates.map(c => c.percentage))).sort((a, b) => parseInt(a) - parseInt(b)),
    [chocolates]
  );

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return chocolates.filter(c => {
      const matchesSearch = !term || c.name.toLowerCase().includes(term) || c.origin.toLowerCase().includes(term) || c.producer.toLowerCase().includes(term);
      const matchesOrigin = selectedOrigin === 'All' || c.origin === selectedOrigin;
      const matchesNote = selectedNote === 'All' || c.tastingNotes.includes(selectedNote);
      const matchesPct = selectedPercentage === 'All' || c.percentage === selectedPercentage;
      return matchesSearch && matchesOrigin && matchesNote && matchesPct;
    });
  }, [chocolates, search, selectedOrigin, selectedNote, selectedPercentage]);

  const resetFilters = () => { setSearch(''); setSelectedOrigin('All'); setSelectedNote('All'); setSelectedPercentage('All'); };

  return (
    <div className="animate-in fade-in duration-700">
      <section className="mb-12">
        <div className="flex flex-col gap-4 mb-8">
          <h1 className="text-5xl font-bold text-primary">Enciclopedia del Cioccolato</h1>
          <p className="text-lg text-on-surface-variant max-w-2xl leading-relaxed">
            Scopri l'archivio definitivo di raccolti rari, produttori artigianali e i complessi profili sensoriali del miglior cacao al mondo.
          </p>
        </div>

        <div className="space-y-8 mb-12">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-end">
            <div className="xl:col-span-4 w-full">
              <label className="text-[10px] font-bold text-on-surface-variant mb-2 block tracking-widest uppercase">Cerca nell'archivio</label>
              <div className="relative">
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Cerca per nome, varietà o marchio..."
                  className="w-full bg-white border border-primary/20 rounded-lg px-4 py-3 focus:border-secondary transition-all outline-none" />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 w-5 h-5 pointer-events-none" />
              </div>
            </div>

            <div className="xl:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
              {[
                { label: 'Origine', value: selectedOrigin, setter: setSelectedOrigin, options: origins, all: 'Tutte le origini' },
                { label: 'Note di Degustazione', value: selectedNote, setter: setSelectedNote, options: notes, all: 'Tutte le note' },
                { label: '% Cacao', value: selectedPercentage, setter: setSelectedPercentage, options: percentages, all: 'Tutte le percentuali' },
              ].map(f => (
                <div key={f.label} className="w-full">
                  <label className="text-[10px] font-bold text-on-surface-variant mb-2 block tracking-widest uppercase">{f.label}</label>
                  <select value={f.value} onChange={e => f.setter(e.target.value)}
                    className="w-full bg-white border border-primary/20 rounded-lg px-4 py-3 transition-colors appearance-none text-sm cursor-pointer hover:border-secondary outline-none">
                    <option value="All">{f.all}</option>
                    {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <div className="flex items-end h-full">
                <button onClick={resetFilters}
                  className="bg-primary/5 text-primary border border-primary/10 w-full h-[46px] mt-auto rounded-lg text-[10px] font-bold px-4 hover:bg-primary hover:text-white transition-all uppercase tracking-widest">
                  Resetta Filtri
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-12">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] bg-surface-container animate-pulse border border-primary/5 rounded-lg flex items-center justify-center">
              <Loader2 className="animate-spin text-primary/20 w-8 h-8" />
            </div>
          ))
        ) : (
          filtered.map(choco => <ChocolateCard key={choco.id} chocolate={choco} onClick={onSelect} />)
        )}
      </section>

      {!loading && (
        <div className="flex flex-col items-center gap-4 py-12 border-t border-primary/10">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">
            Visualizzazione di {filtered.length} voci dell'archivio
          </p>
        </div>
      )}
    </div>
  );
};