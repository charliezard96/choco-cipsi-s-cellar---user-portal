import React from 'react';
import { Producer, TastingEvent } from '../constants';
import { BadgeCheck, ArrowRight, Calendar, MapPin } from 'lucide-react';
import { getCountryCode } from '../lib/countryUtils';

export const ProducerCard: React.FC<{ producer: Producer }> = ({ producer }) => {

  return (
    <div id={`producer-${producer.id}`} className="bg-white p-6 border border-primary/10 flex flex-col gap-6 hover:border-secondary/40 transition-all group h-full">
      <div className="w-full aspect-[3/2] overflow-hidden bg-surface-container shrink-0 shadow-sm">
        <img 
          src={`https://flagcdn.com/w640/${getCountryCode(producer.location)}.png`}
          alt={producer.location}
          className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
        />
      </div>
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {producer.logoUrl && (
                <div className="w-8 h-8 bg-white p-1 rounded shadow-sm border border-primary/5 flex items-center justify-center shrink-0">
                  <img src={producer.logoUrl} className="max-w-full max-h-full object-contain" alt="Logo" />
                </div>
              )}
              <span className="text-[10px] text-secondary uppercase tracking-widest font-bold block">{producer.location}</span>
            </div>
            <h3 className="text-2xl text-primary font-bold tracking-tight">{producer.name}</h3>
          </div>
          {producer.verified && <BadgeCheck className="text-secondary w-6 h-6" />}
        </div>
        <p className="text-sm text-on-surface-variant mb-6 leading-relaxed flex-1 line-clamp-3">
          {producer.description}
        </p>
        <div className="flex flex-wrap gap-2 pt-4 border-t border-primary/5">
          {producer.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="bg-surface-container px-2 py-1 text-[10px] uppercase font-bold text-primary tracking-wider rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export const EventCard: React.FC<{ event: TastingEvent }> = ({ event }) => {
  return (
    <div id={`event-${event.id}`} className="flex flex-col md:flex-row items-center bg-surface-container-low border border-primary/5 hover:border-secondary/30 transition-all duration-300 group">
      <div className="w-full md:w-64 h-48 overflow-hidden shrink-0">
        <img 
          src={event.imageUrl} 
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="flex-grow p-6 flex flex-col md:flex-row justify-between items-center w-full">
        <div>
          <span className="text-[10px] text-secondary uppercase font-bold tracking-widest mb-1 block">{event.series}</span>
          <h3 className="text-xl text-primary font-medium mb-2">{event.title}</h3>
          <div className="flex items-center gap-4 text-on-surface-variant text-sm">
            <span className="flex items-center gap-1"><Calendar size={14} /> {event.date}</span>
            <span className="flex items-center gap-1"><MapPin size={14} /> {event.location}</span>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col items-center md:items-end gap-3">
          <span className="text-xl font-medium text-primary">{event.price}</span>
          <button className="bg-primary text-on-primary px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-stone-800 transition-all">
            {event.status}
          </button>
        </div>
      </div>
    </div>
  );
};
