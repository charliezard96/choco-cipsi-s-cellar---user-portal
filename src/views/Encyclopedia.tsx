import React, { useState } from 'react';
import { Chocolate } from '../constants';
import { ChocolateCard } from '../components/ChocolateCard';
import { Search, Loader2 } from 'lucide-react';

interface EncyclopediaProps {
  onSelect: (id: string) => void;
  chocolates: Chocolate[];
  loading: boolean;
}

export const EncyclopediaView: React.FC<EncyclopediaProps> = ({ onSelect, chocolates, loading }) => {
  const [search, setSearch] = useState('');

  const [selectedOrigin, setSelectedOrigin] = useState('All');
  const [selectedNote, setSelectedNote] = useState('All');
  const [selectedPercentage, setSelectedPercentage] = useState('All');

  const origins = Array.from(new Set(chocolates.map(c => c.origin))).sort();
  const notes = Array.from(new Set(chocolates.flatMap(c => c.tastingNotes))).sort();
  const percentages = Array.from(new Set(chocolates.map(c => c.percentage))).sort((a, b) => parseInt(a as string) - parseInt(b as string));

  const filteredChocolates = chocolates.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      c.origin.toLowerCase().includes(search.toLowerCase()) ||
      c.producer.toLowerCase().includes(search.toLowerCase());
    
    const matchesOrigin = selectedOrigin === 'All' || c.origin === selectedOrigin;
    const matchesNote = selectedNote === 'All' || c.tastingNotes.includes(selectedNote);
    const matchesPercentage = selectedPercentage === 'All' || c.percentage === selectedPercentage;

    return matchesSearch && matchesOrigin && matchesNote && matchesPercentage;
  });

  return (
    <div id="encyclopedia-view" className="animate-in fade-in duration-700">
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
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cerca per nome, varietà o marchio..."
                  className="w-full bg-white border border-primary/20 rounded-lg lora-input px-4 py-3 focus:border-secondary transition-all outline-none"
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 w-5 h-5 pointer-events-none" />
              </div>
            </div>
            
            <div className="xl:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
              <div className="w-full">
                <label className="text-[10px] font-bold text-on-surface-variant mb-2 block tracking-widest uppercase">Origine</label>
                <select 
                  value={selectedOrigin}
                  onChange={(e) => setSelectedOrigin(e.target.value)}
                  className="w-full bg-white border border-primary/20 rounded-lg px-4 py-3 transition-colors appearance-none text-sm cursor-pointer hover:border-secondary outline-none"
                >
                  <option value="All">Tutte le origini</option>
                  {origins.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div className="w-full">
                <label className="text-[10px] font-bold text-on-surface-variant mb-2 block tracking-widest uppercase">Note di Degustazione</label>
                <select 
                  value={selectedNote}
                  onChange={(e) => setSelectedNote(e.target.value)}
                  className="w-full bg-white border border-primary/20 rounded-lg px-4 py-3 transition-colors appearance-none text-sm cursor-pointer hover:border-secondary outline-none"
                >
                  <option value="All">Tutte le note</option>
                  {notes.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              <div className="w-full">
                <label className="text-[10px] font-bold text-on-surface-variant mb-2 block tracking-widest uppercase">% Cacao</label>
                <select 
                  value={selectedPercentage}
                  onChange={(e) => setSelectedPercentage(e.target.value)}
                  className="w-full bg-white border border-primary/20 rounded-lg px-4 py-3 transition-colors appearance-none text-sm cursor-pointer hover:border-secondary outline-none"
                >
                  <option value="All">Tutte le percentuali</option>
                  {percentages.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div className="flex items-end h-full">
                <button 
                  onClick={() => {
                    setSearch('');
                    setSelectedOrigin('All');
                    setSelectedNote('All');
                    setSelectedPercentage('All');
                  }}
                  className="bg-primary/5 text-primary border border-primary/10 w-full h-[46px] mt-auto rounded-lg text-[10px] font-bold px-4 hover:bg-primary hover:text-white transition-all uppercase tracking-widest"
                >
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
          filteredChocolates.map((choco) => (
            <ChocolateCard key={choco.id} chocolate={choco} onClick={onSelect} />
          ))
        )}
      </section>

      {!loading && (
        <div className="flex flex-col items-center gap-4 py-12 border-t border-primary/10">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">Visualizzazione di {filteredChocolates.length} voci dell'archivio</p>
          <button className="border border-secondary text-primary px-12 py-3 text-xs font-bold hover:bg-secondary-container/20 transition-all uppercase tracking-widest">
            Svela Altri Archivi
          </button>
        </div>
      )}
    </div>
  );
};
