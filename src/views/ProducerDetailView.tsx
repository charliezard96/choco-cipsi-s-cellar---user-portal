import React from 'react';
import { Producer, Chocolate } from '../constants';
import { ArrowLeft, MapPin, Users, Sparkles, BookOpen } from 'lucide-react';

interface ProducerDetailProps {
  producer: Producer;
  onBack: () => void;
  brandBars: Chocolate[];
  onSelectChocolate: (id: string) => void;
}

export const ProducerDetailView: React.FC<ProducerDetailProps> = ({ 
  producer, 
  onBack, 
  brandBars,
  onSelectChocolate 
}) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-12 text-xs font-bold uppercase tracking-widest"
      >
        <ArrowLeft size={16} /> Torna ai Produttori
      </button>

      <div className="max-w-4xl mx-auto">
        <header className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end gap-10 pb-12 border-b border-primary/10">
            {producer.logoUrl && (
              <div className="w-32 h-32 bg-white p-6 shadow-xl border border-primary/5 flex items-center justify-center shrink-0 -mb-6 md:mb-0 relative z-10 box-decoration-clone">
                <img src={producer.logoUrl} className="max-w-full max-h-full object-contain" alt={`${producer.name} Logo`} />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 text-secondary font-bold uppercase tracking-[0.4em] text-[10px] mb-4">
                <MapPin size={12} strokeWidth={3} />
                {producer.location}
              </div>
              <h1 className="text-7xl font-bold text-primary tracking-tighter leading-none">{producer.name}</h1>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
            <div className="space-y-8">
              <div>
                <h3 className="flex items-center gap-2 text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-[0.3em] mb-4">
                  <BookOpen size={14} />
                  Filosofia
                </h3>
                <p className="text-xl text-on-surface-variant leading-relaxed italic serif-text">
                  "{producer.philosophy || producer.description}"
                </p>
              </div>

              {producer.specialFeature && (
                <div>
                  <h3 className="flex items-center gap-2 text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-[0.3em] mb-4">
                    <Sparkles size={14} />
                    Caratteristica Speciale
                  </h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed font-medium">
                    {producer.specialFeature}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-8 bg-surface-container-low p-8 border border-primary/5">
              {producer.founders && (
                <div>
                  <h3 className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-3">
                    <Users size={14} />
                    Fondatori
                  </h3>
                  <p className="text-lg text-primary font-bold tracking-tight">
                    {producer.founders}
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-[0.3em] mb-3">
                  Distinzioni
                </h3>
                <div className="flex flex-wrap gap-2">
                  {producer.tags.map(t => (
                    <span key={t} className="bg-secondary-container/30 text-on-secondary-container px-4 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </header>

        <section>
          <h2 className="text-3xl font-bold text-primary mb-10 pb-4 border-b border-primary/10 flex items-center justify-between">
            La Collezione dell'Archivio
            <span className="text-[10px] font-bold text-on-surface-variant/40 tracking-widest uppercase">{brandBars.length} Tavolette catalogate</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {brandBars.map(c => (
              <div 
                key={c.id} 
                onClick={() => onSelectChocolate(c.id)} 
                className="cursor-pointer group flex flex-col h-full"
              >
                <div className="aspect-[4/5] bg-surface-container mb-4 overflow-hidden relative">
                   <img 
                    src={c.imageUrl || "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=800&auto=format&fit=crop"} 
                    className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" 
                    alt={c.name} 
                  />
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors" />
                </div>
                <h3 className="font-bold text-primary text-lg mb-1 group-hover:text-secondary transition-colors">{c.name}</h3>
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-primary/5">
                  <span className="text-[10px] font-bold text-on-surface-variant/60 uppercase">{c.percentage}</span>
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-widest group-hover:translate-x-1 transition-transform">Dettagli →</span>
                </div>
              </div>
            ))}
            
            {brandBars.length === 0 && (
              <div className="col-span-full py-12 text-center bg-surface-container-low border border-dashed border-primary/10 border-primary/20">
                <p className="text-on-surface-variant italic">Nessuna tavoletta di questo produttore è stata ancora catalogata nell'archivio.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
