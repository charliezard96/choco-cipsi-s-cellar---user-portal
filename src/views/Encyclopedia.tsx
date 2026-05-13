import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chocolate } from '../types';
import { ChocolateCard } from '../components/ChocolateCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { Search } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';

const PAGE_SIZE = 24;

interface Props {
  chocolates: Chocolate[];
  loading: boolean;
}

export const EncyclopediaView: React.FC<Props> = ({ chocolates, loading }) => {
  usePageMeta('Enciclopedia', 'Scopri e confronta le migliori tavolette di cioccolato fondente del mondo.');
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedOrigin, setSelectedOrigin] = useState('All');
  const [selectedNote, setSelectedNote] = useState('All');
  const [selectedPercentage, setSelectedPercentage] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => { setCurrentPage(1); }, [search, selectedOrigin, selectedNote, selectedPercentage]);

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

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

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
          Array.from({ length: 24 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          paginated.map(choco => (
            <ChocolateCard key={choco.id} chocolate={choco} onClick={(id) => navigate(`/chocolate/${id}`)} />
          ))
        )}
      </section>

      {!loading && (
  <div className="flex flex-col items-center gap-4 py-12 border-t border-primary/10">
    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">
      {filtered.length} voci · pagina {currentPage} di {totalPages || 1}
    </p>
    {totalPages > 1 && (
      <div className="flex items-center gap-2">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          className="px-4 py-2 rounded-lg border border-primary/10 text-xs font-bold text-primary disabled:opacity-30 hover:bg-primary hover:text-white transition-all uppercase tracking-widest">
          ← Precedente
        </button>
        <div className="flex gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
            .reduce<(number | '...')[]>((acc, p, idx, arr) => {
              if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
              acc.push(p);
              return acc;
            }, [])
            .map((p, i) => p === '...'
              ? <span key={`e${i}`} className="px-2 text-stone-300 text-xs">…</span>
              : <button key={p} onClick={() => setCurrentPage(p as number)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === p ? 'bg-primary text-white' : 'border border-primary/10 text-primary hover:bg-stone-100'}`}>
                  {p}
                </button>
            )}
        </div>
        <button
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          className="px-4 py-2 rounded-lg border border-primary/10 text-xs font-bold text-primary disabled:opacity-30 hover:bg-primary hover:text-white transition-all uppercase tracking-widest">
          Successivo →
        </button>
      </div>
    )}
  </div>
)}
    </div>
  );
};