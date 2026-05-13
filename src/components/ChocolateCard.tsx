import React, { useState } from 'react';
import { GitCompare } from 'lucide-react';
import { Chocolate } from '../types';
import { useCompare } from '../contexts/CompareContext';

interface CardProps {
  chocolate: Chocolate;
  onClick: (id: string) => void;
}

export const ChocolateCard: React.FC<CardProps> = ({ chocolate, onClick }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const { toggleCompare, isInCompare } = useCompare();
  const inCompare = isInCompare(chocolate.id);
  return (
  <div
    onClick={() => onClick(chocolate.id)}
    className="ivory-card group cursor-pointer hover:shadow-xl hover:-translate-y-1"
    role="button"
    tabIndex={0}
    onKeyDown={e => e.key === 'Enter' && onClick(chocolate.id)}
    aria-label={`${chocolate.name} — ${chocolate.producer}`}
  >
    <div className="aspect-[4/5] bg-surface-container overflow-hidden relative">
      <button
        onClick={e => { e.stopPropagation(); toggleCompare(chocolate.id); }}
        className={`absolute top-2 right-2 z-10 p-1.5 rounded-full shadow transition-all ${inCompare ? 'bg-secondary text-primary' : 'bg-white/80 text-stone-400 opacity-0 group-hover:opacity-100'}`}
        aria-label="Confronta">
        <GitCompare size={12} />
      </button>
      <div className={`absolute inset-0 bg-stone-100 transition-opacity duration-500 ${imgLoaded ? 'opacity-0' : 'animate-pulse'}`} />
      <img
        src={chocolate.imageUrl}
        alt={chocolate.name}
        className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
        loading="lazy"
        onLoad={() => setImgLoaded(true)}
      />
    </div>
    <div className="p-3">
      <div className="flex justify-between items-start mb-1">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            {chocolate.logoUrl && (
              <div className="w-5 h-5 bg-white p-0.5 rounded shadow-sm border border-primary/5 flex items-center justify-center shrink-0">
                <img src={chocolate.logoUrl} className="max-w-full max-h-full object-contain" alt="" />
              </div>
            )}
            <span className="text-[9px] font-bold text-secondary uppercase tracking-[0.2em] block">
              {chocolate.producer}
            </span>
          </div>
          <h3 className="text-base font-semibold text-primary leading-tight">{chocolate.name}</h3>
        </div>
        <span className="text-[9px] font-bold bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full shrink-0">
          {chocolate.percentage}
        </span>
      </div>
      <p className="text-xs text-on-surface-variant mb-3 italic">{chocolate.origin}</p>
      <div className="flex flex-wrap gap-1">
        {chocolate.tastingNotes.slice(0, 3).map(note => (
          <span key={note} className="bg-surface-container-high text-on-surface text-[8px] font-semibold uppercase tracking-wider px-1.5 py-0.5">
            {note}
          </span>
        ))}
      </div>
    </div>
  </div>
  );
};