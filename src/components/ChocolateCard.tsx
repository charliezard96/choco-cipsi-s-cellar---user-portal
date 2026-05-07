import React from 'react';
import { Chocolate } from '../types';

interface CardProps {
  chocolate: Chocolate;
  onClick: (id: string) => void;
}

export const ChocolateCard: React.FC<CardProps> = ({ chocolate, onClick }) => {
  return (
    <div 
      id={`bar-${chocolate.id}`}
      onClick={() => {
        console.log('Card clicked:', chocolate.id);
        onClick(chocolate.id);
      }}
      className="ivory-card group cursor-pointer hover:shadow-xl hover:-translate-y-1"
    >
      <div className="aspect-[4/5] bg-surface-container overflow-hidden">
        <img 
          src={chocolate.imageUrl || "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=800&auto=format&fit=crop"} 
          alt={chocolate.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
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
          {chocolate.tastingNotes.slice(0, 3).map((note) => (
            <span 
              key={note}
              className="bg-surface-container-high text-on-surface text-[8px] font-semibold uppercase tracking-wider px-1.5 py-0.5"
            >
              {note}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
