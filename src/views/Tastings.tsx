import React, { useEffect, useState, useMemo } from 'react';
import { TastingEvent } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useAppSettings } from '../contexts/AppSettingsContext';
import { supabase } from '../lib/supabase';
import { Loader2, X, Calendar, MapPin, Users, Ticket, Info, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';

export const TastingsView: React.FC = () => {
  usePageMeta('Degustazioni', 'Partecipa agli eventi di degustazione del cioccolato fine.');
  const { user, profile } = useAuth();
  const { tastingsEnabled, loading: settingsLoading } = useAppSettings();
  const navigate = useNavigate();

  useEffect(() => {
    if (!settingsLoading && !tastingsEnabled) navigate('/', { replace: true });
  }, [tastingsEnabled, settingsLoading, navigate]);
  const [events, setEvents] = useState<TastingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<TastingEvent | null>(null);
  const [eventFilter, setEventFilter] = useState<'upcoming' | 'past'>('upcoming');

  const filteredEvents = useMemo(() => {
    const now = new Date();
    return events.filter(e => {
      const d = new Date(e.event_date);
      return eventFilter === 'upcoming' ? d >= now : d < now;
    });
  }, [events, eventFilter]);

  useEffect(() => {
    fetchEvents();

    const subscription = supabase
      .channel('public:tasting_events')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasting_events' }, (payload: any) => {
        if (payload.eventType === 'INSERT' && payload.new.is_published) {
          setEvents(prev => [payload.new as TastingEvent, ...prev]);
        } else if (payload.eventType === 'DELETE') {
          setEvents(prev => prev.filter(e => e.id !== payload.old.id));
        } else if (payload.eventType === 'UPDATE') {
          if (payload.new.is_published) {
            setEvents(prev => {
              const exists = prev.some(e => e.id === payload.new.id);
              if (exists) return prev.map(e => e.id === payload.new.id ? payload.new as TastingEvent : e);
              return [payload.new as TastingEvent, ...prev].sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());
            });
          } else {
            setEvents(prev => prev.filter(e => e.id !== payload.new.id));
          }
        }
      })
      .subscribe();

    return () => { subscription.unsubscribe(); };
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('tasting_events')
        .select('*')
        .eq('is_published', true)
        .order('event_date', { ascending: false });
      if (error) throw error;
      setEvents(data || []);
    } catch (e) {
      console.error('[Tastings] fetchEvents error:', e);
    } finally {
      setLoading(false);
    }
  };

  const FALLBACK_IMG = 'https://images.unsplash.com/photo-1548907040-4baa42d10919?q=80&w=800&auto=format&fit=crop';

  return (
    <div className="animate-in fade-in duration-700 relative">
      {/* Hero */}
      <section className="mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.3em] mb-4 block">Viaggio Sensoriale</span>
            <h1 className="text-5xl font-bold text-primary mb-6 leading-tight">Padroneggiare l'Arte della Degustazione del Cioccolato</h1>
            <p className="text-lg text-on-surface-variant mb-8 leading-relaxed">
              Una biblioteca non è solo per leggere; è per sperimentare. Scopri le sfumature strutturali della fava, dal suo "snap" alle sue persistenti note di base.
            </p>
          </div>
          <div className="lg:col-span-7 h-[450px] relative rounded-xl overflow-hidden shadow-sm shadow-primary/10">
            <img src="https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=1200&auto=format&fit=crop" className="w-full h-full object-cover" alt="Sessione di degustazione" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="mb-20">
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-3xl font-bold text-primary">La Metodologia di Degustazione</h2>
          <div className="w-1/3 border-b-2 border-primary/5" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { n: '01', title: 'Aspetto', desc: 'Esamina la lucentezza e il colore. Un temperaggio perfetto produce una brillantezza radiosa e l\'assenza di affioramenti.', tags: ['Lucentezza', 'Snap'], dark: false },
            { n: '02', title: 'Aroma', desc: 'Copri il cioccolato con le mani per scaldarlo leggermente. Inspira le note di testa: spesso floreali, speziate o fruttate.', tags: ['Floreale', 'Terroso'], dark: true },
            { n: '04', title: 'Finale', desc: 'Valuta la persistenza e la complessità del retro-gusto. I migliori cru evolvono per oltre un minuto, con note sempre più profonde.', tags: ['Persistenza', 'Complessità'], dark: false },
          ].map(step => (
            <div key={step.n} className={`p-8 border border-primary/10 rounded-lg flex flex-col ${step.dark ? 'bg-primary text-white' : 'bg-surface-container-low'}`}>
              <span className={`text-4xl font-bold mb-6 opacity-50 ${step.dark ? 'text-secondary' : 'text-secondary'}`}>{step.n}</span>
              <h3 className={`text-2xl font-medium mb-2 ${step.dark ? 'text-white' : 'text-primary'}`}>{step.title}</h3>
              <p className={`text-sm flex-grow mb-6 leading-relaxed ${step.dark ? 'text-white/80' : 'text-on-surface-variant'}`}>{step.desc}</p>
              <div className="flex gap-2">
                {step.tags.map(t => (
                  <span key={t} className={`px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wider ${step.dark ? 'bg-white/10 text-white' : 'bg-surface-container text-on-surface-variant'}`}>{t}</span>
                ))}
              </div>
            </div>
          ))}
          <div className="bg-surface-container-highest p-8 border border-primary/10 rounded-lg relative overflow-hidden group">
            <div className="relative z-10 max-w-xs">
              <span className="text-4xl font-bold text-secondary mb-6 opacity-50">03</span>
              <h3 className="text-2xl font-medium text-primary mb-2">Profilo del Palato</h3>
              <p className="text-sm text-on-surface-variant mb-10 leading-relaxed">Sperimenta l'evoluzione dal primo contatto fino al finale.</p>
              <div className="flex flex-col items-center gap-1">
                {['TESTA', 'CUORE', 'FONDO'].map((label, i) => (
                  <div key={label} className={`h-8 bg-secondary/${20 + i * 20} border border-secondary flex items-center justify-center text-[10px] font-bold tracking-widest text-primary`}
                    style={{ width: `${(i + 1) * 64}px` }}>{label}</div>
                ))}
              </div>
            </div>
            <img src="https://images.unsplash.com/photo-1606312619070-d48b4c652a52?q=80&w=800&auto=format&fit=crop"
              className="absolute right-0 bottom-0 w-2/3 opacity-20 -rotate-12 translate-x-1/4 translate-y-1/4 group-hover:rotate-0 transition-transform duration-1000 -z-0" alt="" />
          </div>
        </div>
      </section>

      {/* Events */}
      <section className="mb-20">
        <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
          <h2 className="text-3xl font-bold text-primary">Eventi di Degustazione</h2>
          <div className="flex gap-1 bg-surface-container rounded-full p-1">
            {(['upcoming', 'past'] as const).map(f => (
              <button key={f} onClick={() => setEventFilter(f)}
                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${eventFilter === f ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}>
                {f === 'upcoming' ? 'Prossimi' : 'Passati'}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-primary" size={40} />
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Curatela degli eventi in corso...</span>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => (
              <div key={event.id} className="relative group cursor-pointer" onClick={() => setSelectedEvent(event)}>
                <div className="bg-white rounded-2xl overflow-hidden border border-primary/5 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                  <div className="h-48 overflow-hidden">
                    <img src={event.image_url || FALLBACK_IMG} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="" loading="lazy" />
                  </div>
                  <div className="p-6">
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-widest bg-secondary/10 px-2 py-0.5 rounded mb-3 inline-block">
                      {new Date(event.event_date).toLocaleDateString('it-IT')}
                    </span>
                    <h3 className="text-xl font-bold text-primary mb-2 leading-tight h-14 line-clamp-2">{event.title}</h3>
                    <div className="flex items-center gap-2 text-on-surface-variant text-sm mb-4">
                      <MapPin size={14} className="text-secondary" /><span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-primary/5">
                      <span className="font-bold text-primary">€{event.price?.toFixed(2)}</span>
                      <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-secondary group-hover:gap-2 transition-all">
                        Dettagli <ArrowRight size={12} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="col-span-full text-center py-20 border-2 border-dashed border-primary/10 rounded-xl">
            <p className="text-on-surface-variant font-medium">
              {eventFilter === 'upcoming' ? 'Nessun evento prossimo in programma.' : 'Nessun evento passato trovato.'}
            </p>
          </div>
        )}
      </section>

      {/* Event Detail Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedEvent(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <button onClick={() => setSelectedEvent(null)} className="absolute top-6 right-6 z-10 bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 rounded-full text-white transition-all" aria-label="Chiudi">
                <X size={24} />
              </button>
              <div className="h-64 shrink-0 relative">
                <img src={selectedEvent.image_url || FALLBACK_IMG} className="w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-8 right-8">
                  <h3 className="text-3xl font-bold text-white mb-2 leading-tight">{selectedEvent.title}</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-white/80"><Calendar size={16} className="text-secondary" />
                      <span className="text-xs font-bold uppercase tracking-widest">{new Date(selectedEvent.event_date).toLocaleDateString('it-IT', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/80"><MapPin size={16} className="text-secondary" />
                      <span className="text-xs font-bold uppercase tracking-widest truncate max-w-[200px]">{selectedEvent.location}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { icon: Users, label: 'Capacità', value: `${selectedEvent.max_capacity || 'N/A'} Posti` },
                    { icon: Ticket, label: 'Prezzo', value: `€${selectedEvent.price?.toFixed(2)}` },
                    { icon: Info, label: 'Luogo', value: selectedEvent.venue_name || 'Da definire' },
                  ].map(item => (
                    <div key={item.label} className="bg-stone-50 p-4 rounded-2xl border border-stone-100 flex flex-col items-center justify-center text-center">
                      <item.icon size={20} className="text-secondary mb-2" />
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">{item.label}</span>
                      <span className="text-sm font-black text-primary truncate w-full">{item.value}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-secondary">Descrizione dell'Evento</h4>
                  <p className="text-on-surface-variant leading-relaxed">
                    {selectedEvent.description || "Unisciti a noi per un'esperienza sensoriale unica incentrata sull'evoluzione del cacao pregiato."}
                  </p>
                </div>
                <button className="w-full bg-primary text-white py-4 rounded-2xl font-bold uppercase tracking-[0.2em] shadow-xl hover:shadow-2xl transition-all active:scale-[0.98]">
                  Prenota il tuo Posto
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};