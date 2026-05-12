import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Chocolate, Producer } from '../types';
import { getIconHelper } from '../utils/iconUtils';
import { getAromaColors } from '../utils/colorUtils';
import { findProducerForChocolate } from '../utils/matchUtils';
import { BookOpen, Verified, ArrowLeft, Star, LogIn, RefreshCw, Fingerprint } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AromaVoting } from '../components/AromaVoting';
import { ChocolateSensoryProfile } from '../components/ChocolateSensoryProfile';
import { ChocolateFlavorWheel } from '../components/ChocolateFlavorWheel';
import { useChocolateDetail } from '../hooks/useChocolateDetail';

interface Props {
  chocolates: Chocolate[];
  producers: Producer[];
  loading?: boolean;
}

export const DetailView: React.FC<Props> = ({ chocolates, producers, loading }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, setShowAuthModal } = useAuth();
  const [hoverRating, setHoverRating] = useState(0);
  const [savingRating, setSavingRating] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const chocolate = chocolates.find(c => c.id === id);

  const {
    aromaProfiles, officialNotes, barLevelTags, noteVotes,
    userRating, avgRating, totalRatings,
    refreshTrigger, handleRate, handleToggleVote,
  } = useChocolateDetail(id || '', user?.id);

  useEffect(() => {
    if (!statusMsg) return;
    const t = setTimeout(() => setStatusMsg(null), 3000);
    return () => clearTimeout(t);
  }, [statusMsg]);

  // Must be before early returns to satisfy Rules of Hooks
  const groupedTags = useMemo(() => {
    const map = new Map<string, { hasGroupTag: boolean; subgroups: string[]; hex_color: string | null; icon_slug: string | null }>();
    barLevelTags.forEach(tag => {
      if (!map.has(tag.group_name)) {
        const rep = aromaProfiles.find(p => p.group_name === tag.group_name);
        map.set(tag.group_name, { hasGroupTag: false, subgroups: [], hex_color: rep?.hex_color ?? null, icon_slug: rep?.icon_slug ?? null });
      }
      const entry = map.get(tag.group_name)!;
      if (tag.subgroup_name === '') entry.hasGroupTag = true;
      else entry.subgroups.push(tag.subgroup_name);
    });
    return Array.from(map.entries()).map(([groupName, data]) => ({ groupName, ...data }));
  }, [barLevelTags, aromaProfiles]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <RefreshCw size={28} className="animate-spin text-secondary" />
      </div>
    );
  }

  if (!chocolate) {
    return (
      <div className="text-center py-20">
        <p className="text-on-surface-variant">Tavoletta non trovata.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-secondary font-bold text-xs uppercase tracking-widest underline">Torna all'archivio</button>
      </div>
    );
  }

  const producer = findProducerForChocolate(chocolate, producers);

  const onRate = async (rating: number) => {
    if (!user) { setShowAuthModal(true, 'login'); return; }
    setSavingRating(true);
    try {
      await handleRate(rating);
      setStatusMsg({ text: 'Valutazione salvata!', type: 'success' });
    } catch {
      setStatusMsg({ text: 'Errore nel salvataggio.', type: 'error' });
    } finally {
      setSavingRating(false);
    }
  };

  const META = [
    { label: 'Percentuale di Cacao', value: chocolate.percentage },
    { label: 'Produttore / Marchio', value: chocolate.producer, action: () => navigate(`/producers/${chocolate.producerId || chocolate.producer}`) },
    { label: 'Origine', value: chocolate.origin },
    { label: 'Regione', value: chocolate.region || 'Sconosciuta' },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-8 text-xs font-bold uppercase tracking-widest">
        <ArrowLeft size={16} /> Torna alla Libreria
      </button>

      {/* Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 items-center">
        <div className="hidden lg:block lg:col-span-3">
          <div className="aspect-[3/4] bg-surface-container overflow-hidden rounded-2xl shadow-sm border border-primary/5">
            <img src={chocolate.imageUrl} alt="Confezione" className="w-full h-full object-cover grayscale-[10%] hover:grayscale-0 transition-all duration-1000" loading="lazy" />
          </div>
        </div>
        <div className="lg:col-span-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-primary leading-none tracking-tighter mb-4">{chocolate.name}</h1>
          <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.5em] block mb-6">Scheda Tecnica</span>
          <div className="lg:hidden grid grid-cols-2 gap-4 mb-8">
            <div className="aspect-[3/4] bg-surface-container overflow-hidden rounded-2xl"><img src={chocolate.imageUrl} alt="" className="w-full h-full object-cover" /></div>
            <div className="aspect-[3/4] bg-surface-container overflow-hidden rounded-2xl"><img src={chocolate.imageBars} alt="" className="w-full h-full object-cover" /></div>
          </div>
        </div>
        <div className="hidden lg:block lg:col-span-3">
          <div className="aspect-[3/4] bg-surface-container overflow-hidden rounded-2xl shadow-sm border border-primary/5">
            <img src={chocolate.imageBars} alt="Dettaglio tavoletta" className="w-full h-full object-cover grayscale-[10%] hover:grayscale-0 transition-all duration-1000" loading="lazy" />
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-6 py-12 border-y border-primary/10 mb-12">
        {META.map(m => (
          <div key={m.label}>
            <span className="text-[10px] font-bold text-on-surface-variant/40 block uppercase tracking-widest mb-3">{m.label}</span>
            {m.action ? (
              <button onClick={m.action} className="text-3xl font-bold text-primary hover:text-secondary transition-colors underline decoration-secondary/30 underline-offset-8 text-left">
                {m.value}
              </button>
            ) : (
              <span className="text-3xl font-bold text-primary block leading-none">{m.value}</span>
            )}
          </div>
        ))}
      </div>

      {/* Profilo Aromatico d'Archivio — card per famiglia */}
      <div className="py-12 border-b border-primary/10">
        <h3 className="text-[10px] font-bold text-on-surface-variant/50 tracking-widest uppercase mb-8 flex items-center gap-2">
          <BookOpen size={14} className="text-secondary" /> Profilo Aromatico d'Archivio
        </h3>

        {(groupedTags.length > 0 || officialNotes.length > 0) ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Card per ogni famiglia da bar_level_tags */}
            {groupedTags.map(({ groupName, subgroups, hex_color, icon_slug }) => {
              const groupColors = getAromaColors(hex_color);
              const GroupIcon = getIconHelper(icon_slug, groupName);
              const familyNotes = officialNotes.filter(n => n.group_name === groupName);
              return (
                <div key={groupName} className="rounded-2xl border overflow-hidden shadow-sm" style={{ borderColor: groupColors.border }}>
                  {/* Header */}
                  <div className="flex items-center gap-2.5 px-5 py-3.5" style={{ backgroundColor: groupColors.bg }}>
                    <GroupIcon size={17} strokeWidth={2.5} color={groupColors.fg} />
                    <span className="text-xs font-black uppercase tracking-wider" style={{ color: groupColors.fg }}>{groupName}</span>
                  </div>
                  {/* Body */}
                  <div className="p-4 space-y-3 bg-white/50">
                    {subgroups.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {subgroups.map(sub => {
                          const subRep = aromaProfiles.find(p => p.group_name === groupName && p.subgroup_name === sub);
                          const subColors = getAromaColors(subRep?.hex_color ?? hex_color);
                          return (
                            <span key={sub} className="px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wide"
                              style={{ backgroundColor: subColors.bg, borderColor: subColors.border, color: subColors.fg }}>
                              {sub}
                            </span>
                          );
                        })}
                      </div>
                    )}
                    {familyNotes.length > 0 && (
                      <>
                        {subgroups.length > 0 && <div className="h-px bg-primary/5" />}
                        <div className="flex flex-wrap gap-1.5">
                          {familyNotes.map(note => {
                            const NoteIcon = getIconHelper(note.icon_slug, note.group_name);
                            const noteColors = getAromaColors(note.hex_color);
                            return (
                              <div key={note.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border shadow-sm"
                                style={{ backgroundColor: noteColors.bg, borderColor: noteColors.border }}>
                                <NoteIcon size={13} strokeWidth={2.5} color={noteColors.fg} />
                                <span className="text-[10px] font-black uppercase tracking-wide" style={{ color: noteColors.fg }}>{note.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Card per note orfane (famiglia non in bar_level_tags) */}
            {(() => {
              const taggedFamilies = new Set(groupedTags.map(g => g.groupName));
              const orphans = officialNotes.filter(n => !taggedFamilies.has(n.group_name));
              const orphanFamilies = [...new Set(orphans.map(n => n.group_name))];
              return orphanFamilies.map(family => {
                const familyNotes = orphans.filter(n => n.group_name === family);
                const rep = familyNotes[0];
                const groupColors = getAromaColors(rep?.hex_color);
                const GroupIcon = getIconHelper(rep?.icon_slug ?? null, family);
                return (
                  <div key={family} className="rounded-2xl border overflow-hidden shadow-sm" style={{ borderColor: groupColors.border }}>
                    <div className="flex items-center gap-2.5 px-5 py-3.5" style={{ backgroundColor: groupColors.bg }}>
                      <GroupIcon size={17} strokeWidth={2.5} color={groupColors.fg} />
                      <span className="text-xs font-black uppercase tracking-wider" style={{ color: groupColors.fg }}>{family}</span>
                    </div>
                    <div className="p-4 flex flex-wrap gap-1.5 bg-white/50">
                      {familyNotes.map(note => {
                        const NoteIcon = getIconHelper(note.icon_slug, note.group_name);
                        const noteColors = getAromaColors(note.hex_color);
                        return (
                          <div key={note.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border shadow-sm"
                            style={{ backgroundColor: noteColors.bg, borderColor: noteColors.border }}>
                            <NoteIcon size={13} strokeWidth={2.5} color={noteColors.fg} />
                            <span className="text-[10px] font-black uppercase tracking-wide" style={{ color: noteColors.fg }}>{note.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        ) : chocolate.tastingNotes.length > 0 ? (
          <div className="flex flex-wrap gap-4">
            {chocolate.tastingNotes.map(name => (
              <div key={name} className="flex items-center gap-3 px-6 py-3 rounded-2xl border border-primary/10 bg-stone-50/50 shadow-sm">
                <Verified size={16} className="text-stone-300" />
                <span className="text-xs font-black uppercase tracking-wider text-stone-400">{name}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 py-2">
            <Fingerprint size={16} className="text-stone-200" />
            <span className="text-sm text-stone-300 italic font-medium">Nessuna nota d'archivio disponibile.</span>
          </div>
        )}
      </div>

      {/* Flavor Wheel */}
      <div className="mt-20 py-20 border-y border-primary/5 bg-stone-50/30 overflow-hidden relative">
        <div className="max-w-4xl mx-auto px-4">
          <ChocolateFlavorWheel chocolateId={chocolate.id} profiles={aromaProfiles} refreshTrigger={refreshTrigger} />
        </div>
      </div>

      {/* Two-column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-20 items-stretch">
        <div className="flex flex-col gap-12">
          <div className="bg-stone-50 p-12 border border-primary/5 shadow-sm rounded-3xl">
            <h3 className="text-xl font-bold text-primary mb-8 flex items-center gap-3"><BookOpen className="text-secondary" size={20} /> Descrizione Storica</h3>
            <p className="text-xs text-on-surface-variant/90 leading-relaxed italic font-medium">{chocolate.description}</p>
          </div>
          <div className="bg-white p-12 border border-primary/10 shadow-sm rounded-3xl flex-1">
            <ChocolateSensoryProfile chocolateId={chocolate.id} userId={user?.id} profiles={aromaProfiles} refreshTrigger={refreshTrigger} />
          </div>
        </div>
        <div className="flex flex-col gap-12">
          {/* Ratings */}
          <div className="bg-white p-12 border border-primary/10 shadow-sm rounded-3xl">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-xl font-bold text-primary mb-2">Feedback degli Intenditori</h3>
                <p className="text-xs font-bold text-secondary uppercase tracking-widest">Valutazione Globale della Community</p>
              </div>
              {avgRating !== null && (
                <div className="text-right">
                  <div className="text-4xl font-bold text-primary">{avgRating.toFixed(1)}</div>
                  <div className="text-[10px] font-bold text-on-surface-variant/40 uppercase">da {totalRatings} voti</div>
                </div>
              )}
            </div>
            <div className="mb-12">
              <p className="text-sm text-on-surface-variant mb-6 font-medium">Come valuteresti questo raccolto specifico?</p>
              <div className="flex gap-3 items-center">
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} disabled={savingRating}
                    onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)}
                    onClick={() => onRate(star)}
                    className={`transition-transform active:scale-90 ${savingRating ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <Star size={42} className={`transition-colors duration-200 ${(hoverRating || userRating || 0) >= star ? 'text-secondary fill-secondary' : 'text-surface-container-high'}`} />
                  </button>
                ))}
                {savingRating && <RefreshCw size={24} className="animate-spin text-secondary ml-2" />}
              </div>
              {statusMsg && <p className={`mt-4 text-[10px] font-bold uppercase tracking-widest ${statusMsg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{statusMsg.text}</p>}
              {userRating && !statusMsg && <p className="mt-4 text-[10px] font-bold text-secondary uppercase tracking-widest">Hai valutato questa voce: {userRating} Stelle</p>}
              {!user && (
                <button onClick={() => setShowAuthModal(true, 'login')}
                  className="mt-6 flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest hover:text-secondary transition-colors">
                  <LogIn size={14} /> Accedi per valutare
                </button>
              )}
            </div>
            <div className="pt-8 border-t border-primary/5">
              <div className="flex items-start gap-4">
                <Verified className="text-secondary shrink-0" strokeWidth={2.5} />
                <div>
                  <p className="text-[10px] font-bold text-primary mb-2 uppercase tracking-widest">AUTENTICITÀ VERIFICATA</p>
                  <p className="text-xs text-on-surface-variant leading-relaxed font-medium">Profilo catalogato secondo blind tasting standards.</p>
                </div>
              </div>
            </div>
          </div>
          {/* Aroma Voting */}
          <div className="bg-stone-50 p-12 border border-primary/10 shadow-sm rounded-3xl flex-1">
            <div className="mb-10">
              <h3 className="text-xl font-bold text-primary mb-2">Nota la Differenza</h3>
              <p className="text-xs font-bold text-secondary uppercase tracking-widest">Esplora e vota le sfumature sensoriali</p>
            </div>
            <AromaVoting chocolateId={chocolate.id} profiles={aromaProfiles} votes={noteVotes} onVote={handleToggleVote} userId={user?.id} />
          </div>
        </div>
      </div>
    </div>
  );
};