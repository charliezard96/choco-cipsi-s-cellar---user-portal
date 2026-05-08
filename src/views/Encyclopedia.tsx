import React from 'react';
import { TastingEvent } from '../types';
import { Calendar, MapPin } from 'lucide-react';

/**
 * EventCard — card per gli eventi di degustazione (legacy).
 * Il ProducerCard originale non era usato da nessuna view (Producers usa il proprio layout inline),
 * quindi è stato rimosso per rispettare il principio YAGNI.
 * Se ti serve in futuro, puoi estrarre il layout da ProducersView.
 */
export const EventCard: React.FC<{ event: TastingEvent }> = ({ event }) => (
  <div className="flex flex-col md:flex-row items-center bg-surface-container-low border border-primary/5 hover:border-secondary/30 transition-all duration-300 group">
    <div className="w-full md:w-64 h-48 overflow-hidden shrink-0">
      <img
        src={event.imageUrl || event.image_url}
        alt={event.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
    </div>
    <div className="flex-grow p-6 flex flex-col md:flex-row justify-between items-center w-full">
      <div>
        {event.series && <span className="text-[10px] text-secondary uppercase font-bold tracking-widest mb-1 block">{event.series}</span>}
        <h3 className="text-xl text-primary font-medium mb-2">{event.title}</h3>
        <div className="flex items-center gap-4 text-on-surface-variant text-sm">
          <span className="flex items-center gap-1"><Calendar size={14} /> {event.date || event.event_date}</span>
          <span className="flex items-center gap-1"><MapPin size={14} /> {event.location}</span>
        </div>
      </div>
      <div className="mt-4 md:mt-0 flex flex-col items-center md:items-end gap-3">
        <span className="text-xl font-medium text-primary">{event.price}</span>
        <button className="bg-primary text-on-primary px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-stone-800 transition-all">
          {event.status || 'Prenota'}
        </button>
      </div>
    </div>
  </div>
);