import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Verified } from 'lucide-react';
import { Chocolate } from '../types';

interface Props {
  chocolates: Chocolate[];
}

const Row: React.FC<{ label: string; a: React.ReactNode; b: React.ReactNode }> = ({ label, a, b }) => (
  <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-4 py-5 border-b border-stone-50 last:border-0">
    <div className="text-right">{a}</div>
    <div className="w-28 text-center shrink-0">
      <span className="text-[9px] font-black text-stone-300 uppercase tracking-widest">{label}</span>
    </div>
    <div className="text-left">{b}</div>
  </div>
);

export const CompareView: React.FC<Props> = ({ chocolates }) => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const idA = params.get('a');
  const idB = params.get('b');
  const a = chocolates.find(c => c.id === idA);
  const b = chocolates.find(c => c.id === idB);

  if (!a || !b) return (
    <div className="text-center py-20">
      <p className="text-stone-400 text-sm font-medium">Tavolette non trovate.</p>
      <button onClick={() => navigate('/')} className="mt-4 text-xs font-bold text-secondary uppercase tracking-widest">
        Torna all'enciclopedia
      </button>
    </div>
  );

  const sharedNotes = a.tastingNotes.filter(n => b.tastingNotes.includes(n));

  const Val: React.FC<{ v: string; align?: 'left' | 'right' }> = ({ v, align = 'right' }) => (
    <span className={`text-sm font-bold text-primary block ${align === 'right' ? 'ml-auto text-right' : ''}`}>{v || '—'}</span>
  );

  return (
    <div className="animate-in fade-in duration-700 max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-8 text-xs font-bold uppercase tracking-widest">
        <ArrowLeft size={16} /> Torna indietro
      </button>

      <h1 className="text-2xl font-bold text-primary mb-2">Confronto</h1>
      <p className="text-xs text-stone-400 font-medium mb-10 uppercase tracking-widest">Analisi comparativa delle tavolette selezionate</p>

      {/* Hero images */}
      <div className="grid grid-cols-2 gap-6 mb-12">
        {[a, b].map(bar => (
          <button key={bar.id} onClick={() => navigate(`/chocolate/${bar.id}`)}
            className="group text-left">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-stone-50 mb-3">
              <img src={bar.imageUrl} alt={bar.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
            <span className="text-[9px] font-black text-secondary uppercase tracking-widest block">{bar.producer}</span>
            <span className="text-sm font-bold text-primary leading-tight block">{bar.name}</span>
          </button>
        ))}
      </div>

      {/* Comparison table */}
      <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-6 md:p-10 mb-8">
        <Row label="% Cacao"
          a={<Val v={a.percentage} />}
          b={<Val v={b.percentage} align="left" />} />
        <Row label="Origine"
          a={<Val v={a.origin} />}
          b={<Val v={b.origin} align="left" />} />
        <Row label="Regione"
          a={<Val v={a.region} />}
          b={<Val v={b.region} align="left" />} />
        <Row label="Note"
          a={
            <div className="flex flex-wrap gap-1 justify-end">
              {a.tastingNotes.map(n => (
                <span key={n} className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${sharedNotes.includes(n) ? 'bg-secondary/15 text-secondary' : 'bg-stone-100 text-stone-400'}`}>{n}</span>
              ))}
            </div>
          }
          b={
            <div className="flex flex-wrap gap-1">
              {b.tastingNotes.map(n => (
                <span key={n} className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${sharedNotes.includes(n) ? 'bg-secondary/15 text-secondary' : 'bg-stone-100 text-stone-400'}`}>{n}</span>
              ))}
            </div>
          } />
      </div>

      {/* Shared notes callout */}
      {sharedNotes.length > 0 && (
        <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-6 flex items-start gap-4">
          <Verified size={18} className="text-secondary shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-black text-primary uppercase tracking-widest mb-2">Note in comune</p>
            <div className="flex flex-wrap gap-2">
              {sharedNotes.map(n => (
                <span key={n} className="text-[10px] font-bold text-secondary bg-secondary/10 px-3 py-1 rounded-full uppercase tracking-widest">{n}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
