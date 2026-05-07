import React, { useState, useEffect } from 'react';
import { Chocolate, AromaProfile } from '../types';
import { getIconHelper } from '../utils/iconUtils';
import * as Icons from 'lucide-react';
import { BookOpen, Verified, ArrowLeft, Star, LogIn, RefreshCw, Fingerprint } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AromaVoting } from '../components/AromaVoting';
import { ChocolateSensoryProfile } from '../components/ChocolateSensoryProfile';
import { ChocolateFlavorWheel } from '../components/ChocolateFlavorWheel';
import { useChocolateDetail } from '../hooks/useChocolateDetail';

interface DetailProps {
  chocolate: Chocolate;
  onBack: () => void;
  onSelectProducer: (id: string) => void;
  producerLogoUrl?: string;
}

export const DetailView: React.FC<DetailProps> = ({ chocolate, onBack, onSelectProducer, producerLogoUrl }) => {
  const { user, setShowAuthModal } = useAuth();
  const [hoverRating, setHoverRating] = useState(0);
  const [savingRating, setSavingRating] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const {
    aromaProfiles,
    officialNotes,
    noteVotes,
    userRating,
    avgRating,
    totalRatings,
    refreshTrigger,
    handleRate,
    handleToggleVote
  } = useChocolateDetail(chocolate.id, user?.id);

  useEffect(() => {
    if (statusMsg) {
      const timer = setTimeout(() => setStatusMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMsg]);

  const onRateInternal = async (rating: number) => {
    if (!user) {
      setShowAuthModal(true, 'login');
      return;
    }
    setSavingRating(true);
    setStatusMsg(null);
    try {
      await handleRate(rating);
      setStatusMsg({ text: 'Valutazione salvata!', type: 'success' });
    } catch (e: any) {
      console.error('onRateInternal error:', e);
      setStatusMsg({ text: 'Errore nel salvataggio della valutazione.', type: 'error' });
    } finally {
      setSavingRating(false);
    }
  };


  return (
    <div id="detail-view" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-8 text-xs font-bold uppercase tracking-widest"
      >
        <ArrowLeft size={16} /> Torna alla Libreria
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 items-center">
        {/* Left Image */}
        <div className="hidden lg:block lg:col-span-3">
          <div className="aspect-[3/4] bg-surface-container overflow-hidden rounded-2xl shadow-sm border border-primary/5">
            <img 
              src={chocolate.imageUrl || "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=800&auto=format&fit=crop"} 
              alt="Product packaging" 
              className="w-full h-full object-cover grayscale-[10%] hover:grayscale-0 transition-all duration-1000"
            />
          </div>
        </div>

        {/* Center Title area */}
        <div className="lg:col-span-6 text-center">
          <div className="mb-4">
             <h1 className="text-3xl md:text-4xl font-bold text-primary leading-none tracking-tighter mb-4">{chocolate.name}</h1>
             <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.5em] block mb-6">Scheda Tecnica</span>
          </div>
          
          <div className="lg:hidden grid grid-cols-2 gap-4 mb-8">
             <div className="aspect-[3/4] bg-surface-container overflow-hidden rounded-2xl">
               <img src={chocolate.imageUrl} alt="" className="w-full h-full object-cover" />
             </div>
             <div className="aspect-[3/4] bg-surface-container overflow-hidden rounded-2xl">
               <img src={chocolate.imageBars} alt="" className="w-full h-full object-cover" />
             </div>
          </div>
        </div>

        {/* Right Image */}
        <div className="hidden lg:block lg:col-span-3">
          <div className="aspect-[3/4] bg-surface-container overflow-hidden rounded-2xl shadow-sm border border-primary/5">
            <img 
              src={chocolate.imageBars || "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?q=80&w=800&auto=format&fit=crop"} 
              alt="Chocolate bar detail" 
              className="w-full h-full object-cover grayscale-[10%] hover:grayscale-0 transition-all duration-1000"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
        <div className="lg:col-span-12">
          {/* Metadata info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-6 py-12 border-y border-primary/10">
            <div>
              <span className="text-[10px] font-bold text-on-surface-variant/40 block uppercase tracking-widest mb-3">Percentuale di Cacao</span>
              <span className="text-3xl font-bold text-primary">{chocolate.percentage}</span>
            </div>
            
            <div>
              <span className="text-[10px] font-bold text-on-surface-variant/40 block uppercase tracking-widest mb-3">Produttore / Marchio</span>
              <button 
                onClick={() => onSelectProducer(chocolate.producerId || chocolate.producer)}
                className="flex items-center gap-3 hover:text-secondary transition-all group cursor-pointer text-left"
              >
                <span className="text-3xl font-bold text-primary group-hover:text-secondary transition-colors underline decoration-secondary/30 underline-offset-8">{chocolate.producer}</span>
              </button>
            </div>

            <div>
              <span className="text-[10px] font-bold text-on-surface-variant/40 block uppercase tracking-widest mb-3">Origine</span>
              <span className="text-3xl font-bold text-primary block leading-none">{chocolate.origin}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-on-surface-variant/40 block uppercase tracking-widest mb-3">Regione</span>
              <span className="text-3xl font-bold text-primary">{chocolate.region || "Sconosciuta"}</span>
            </div>
          </div>

          {/* Tasting Notes - Immediately after info */}
          <div className="py-12 border-b border-primary/10">
            <h3 className="text-[10px] font-bold text-on-surface-variant/50 tracking-widest uppercase mb-6 flex items-center gap-2">
              <BookOpen size={14} className="text-secondary" />
              Profilo Aromatico d'Archivio
            </h3>
            <div className="flex flex-wrap gap-4">
              {officialNotes.length > 0 ? (
                officialNotes.map(profile => {
                  const IconComponent = getIconHelper(profile.icon_slug, profile.group_name);
                  
                  return (
                    <div 
                      key={profile.id} 
                      className="flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all hover:scale-105 shadow-sm"
                      style={{ 
                        backgroundColor: profile.hex_color ? `${profile.hex_color}15` : 'transparent',
                        borderColor: profile.hex_color ? `${profile.hex_color}50` : 'rgba(var(--color-primary), 0.1)',
                      }}
                    >
                      <IconComponent size={18} strokeWidth={2.5} color={profile.hex_color || 'inherit'} />
                      <span className="text-xs font-black uppercase tracking-wider text-primary">{profile.name}</span>
                    </div>
                  );
                })
              ) : chocolate.tastingNotes && chocolate.tastingNotes.length > 0 ? (
                // Fallback to names if relations aren't set up
                chocolate.tastingNotes.map(noteName => (
                  <div 
                    key={noteName}
                    className="flex items-center gap-3 px-6 py-3 rounded-2xl border border-primary/10 bg-stone-50/50 shadow-sm"
                  >
                    <Verified size={16} className="text-stone-300" />
                    <span className="text-xs font-black uppercase tracking-wider text-stone-400">{noteName}</span>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-3 py-2">
                  <Fingerprint size={16} className="text-stone-200" />
                  <span className="text-sm text-stone-300 italic font-medium">Nessuna nota d'archivio disponibile per questo lotto.</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-20 py-20 border-y border-primary/5 bg-stone-50/30 overflow-hidden relative">
             <div className="max-w-4xl mx-auto px-4">
                <ChocolateFlavorWheel 
                  chocolateId={chocolate.id} 
                  profiles={aromaProfiles} 
                  refreshTrigger={refreshTrigger} 
                />
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-20 items-stretch">
            {/* Column 1: Knowledge & Archives */}
            <div className="flex flex-col gap-12">
              <div className="bg-stone-50 p-12 border border-primary/5 shadow-sm rounded-3xl shrink-0">
                <h3 className="text-xl font-bold text-primary mb-8 flex items-center gap-3">
                  <BookOpen className="text-secondary" size={20} />
                  Descrizione Storica
                </h3>
                <p className="text-xs text-on-surface-variant/90 leading-relaxed italic serif-text font-medium">
                  {chocolate.description}
                </p>
              </div>

              <div className="bg-white p-12 border border-primary/10 shadow-sm rounded-3xl flex-1">
                <ChocolateSensoryProfile 
                   chocolateId={chocolate.id}
                   userId={user?.id}
                   profiles={aromaProfiles}
                   refreshTrigger={refreshTrigger}
                />
              </div>
            </div>

            {/* Column 2: Feedback & Interaction */}
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
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        disabled={savingRating}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => onRateInternal(star)}
                        className={`transition-transform active:scale-90 ${savingRating ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Star 
                          size={42} 
                          className={`transition-colors duration-200 ${
                            (hoverRating || userRating || 0) >= star 
                              ? 'text-secondary fill-secondary' 
                              : 'text-surface-container-high'
                          }`} 
                        />
                      </button>
                    ))}
                    {savingRating && <RefreshCw size={24} className="animate-spin text-secondary ml-2" />}
                  </div>
                  {statusMsg && (
                    <p className={`mt-4 text-[10px] font-bold uppercase tracking-widest ${statusMsg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                      {statusMsg.text}
                    </p>
                  )}
                  {userRating && !statusMsg && (
                    <p className="mt-4 text-[10px] font-bold text-secondary uppercase tracking-widest">Hai valutato questa voce: {userRating} Stelle</p>
                  )}
                  {!user && (
                    <button 
                      onClick={() => setShowAuthModal(true, 'login')}
                      className="mt-6 flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest hover:text-secondary transition-colors"
                    >
                      <LogIn size={14} /> Accedi per valutare questo raccolto
                    </button>
                  )}
                </div>

                <div className="pt-8 border-t border-primary/5">
                  <div className="flex items-start gap-4">
                    <Verified className="text-secondary shrink-0" strokeWidth={2.5} />
                    <div>
                      <p className="text-[10px] font-bold text-primary mb-2 uppercase tracking-widest">AUTENTICITÀ VERIFICATA</p>
                      <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
                        Profilo catalogato secondo blind tasting standards e certificato dalla rete di sommelier dell'archivio.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Note Voting Section */}
              <div className="bg-stone-50 p-12 border border-primary/10 shadow-sm rounded-3xl flex-1">
                 <div className="mb-10">
                   <h3 className="text-xl font-bold text-primary mb-2">Nota la Differenza</h3>
                   <p className="text-xs font-bold text-secondary uppercase tracking-widest">Esplora e vota le sfumature sensoriali</p>
                 </div>
                 
                 <AromaVoting 
                    chocolateId={chocolate.id}
                    profiles={aromaProfiles}
                    votes={noteVotes}
                    onVote={handleToggleVote}
                    userId={user?.id}
                 />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
