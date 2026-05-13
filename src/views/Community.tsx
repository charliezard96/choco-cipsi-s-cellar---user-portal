import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, Trophy, Users, Loader2, ArrowRight, X, MapPin, Activity } from 'lucide-react';
import { Chocolate, CommunityProfile, TopRatedChocolate } from '../types';
import { profileService } from '../services/profileService';
import { ratingService } from '../services/ratingService';
import { motion, AnimatePresence } from 'motion/react';
import { usePageMeta } from '../hooks/usePageMeta';

interface Props {
  chocolates: Chocolate[];
}

export const CommunityView: React.FC<Props> = ({ chocolates }) => {
  usePageMeta('Community', 'Scopri i degustatori più attivi e le tavolette più apprezzate dalla community.');
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<CommunityProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const [topChocolates, setTopChocolates] = useState<TopRatedChocolate[]>([]);
  const [loadingTop, setLoadingTop] = useState(true);
  const [selectedUser, setSelectedUser] = useState<CommunityProfile | null>(null);
  const [selectedUserRatings, setSelectedUserRatings] = useState<any[]>([]);
  const [loadingRatings, setLoadingRatings] = useState(false);
  const [activeUsers, setActiveUsers] = useState<(CommunityProfile & { ratingCount: number })[]>([]);
  const [loadingActive, setLoadingActive] = useState(true);

  useEffect(() => { fetchTopRated(); fetchActive(); }, [chocolates]);

  const fetchTopRated = async () => {
    try {
      setLoadingTop(true);
      const allRatings = await ratingService.fetchAllRatings();
      const stats: Record<string, { total: number; count: number }> = {};
      allRatings.forEach(r => {
        if (!stats[r.chocolate_id]) stats[r.chocolate_id] = { total: 0, count: 0 };
        stats[r.chocolate_id].total += r.rating;
        stats[r.chocolate_id].count += 1;
      });
      const list: TopRatedChocolate[] = Object.entries(stats)
        .map(([id, s]) => {
          const choco = chocolates.find(c => c.id === String(id));
          if (!choco) return null;
          return { ...choco, averageRating: s.total / s.count, ratingCount: s.count };
        })
        .filter((c): c is TopRatedChocolate => c !== null)
        .sort((a, b) => b.averageRating - a.averageRating || b.ratingCount - a.ratingCount)
        .slice(0, 5);
      setTopChocolates(list);
    } catch (e) {
      console.error('[Community] fetchTopRated error:', e);
    } finally {
      setLoadingTop(false);
    }
  };

  const fetchActive = async () => {
    try {
      setLoadingActive(true);
      setActiveUsers(await profileService.fetchActive(6));
    } catch (e) { console.error('[Community] fetchActive error:', e); }
    finally { setLoadingActive(false); }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setSearching(true);
    try { setSearchResults(await profileService.search(searchTerm)); }
    catch (e) { console.error('[Community] search error:', e); }
    finally { setSearching(false); }
  };

  const openProfile = async (user: CommunityProfile) => {
    setSelectedUser(user);
    setLoadingRatings(true);
    try { setSelectedUserRatings(await ratingService.fetchUserRatings(user.id)); }
    catch (e) { console.error('[Community] fetchUserRatings error:', e); }
    finally { setLoadingRatings(false); }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-16 animate-in fade-in duration-700">
      <section className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 mb-4">
          <Users size={16} className="text-secondary" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">Il Cerchio degli Intenditori</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-serif italic text-primary">Archivio della Community</h1>
        <p className="text-on-surface-variant max-w-2xl mx-auto text-lg">
          Scopri altri degustatori, esplora le loro collezioni private e scopri cosa ne pensa la community.
        </p>
      </section>

      {/* Degustatori Attivi */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <Activity size={18} className="text-secondary" />
          <h2 className="text-xl font-bold text-primary">Degustatori Attivi</h2>
        </div>
        {loadingActive ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white border border-stone-100 rounded-2xl p-4 flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-stone-100" />
                <div className="h-3 bg-stone-100 rounded w-3/4" />
                <div className="h-2 bg-stone-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : activeUsers.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {activeUsers.map(u => (
              <button key={u.id} onClick={() => openProfile(u)}
                className="group bg-white border border-stone-100 hover:border-secondary/30 hover:shadow-lg rounded-2xl p-4 flex flex-col items-center gap-2 transition-all text-center">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                  {u.avatar_url
                    ? <img src={u.avatar_url} className="w-full h-full object-cover" alt={u.username || ''} />
                    : <div className="w-full h-full flex items-center justify-center text-xl font-serif italic text-stone-400">{u.username?.[0]?.toUpperCase() || 'U'}</div>}
                </div>
                <span className="text-xs font-bold text-primary truncate w-full">{u.name || u.username}</span>
                <span className="text-[10px] text-secondary font-black">{u.ratingCount} rec.</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-stone-400 italic text-sm">Nessun degustatore attivo trovato.</p>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-primary/5 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-primary flex items-center gap-3"><Search className="text-secondary" size={24} /> Trova un Intenditore</h2>
            <form onSubmit={handleSearch} className="relative">
              <input type="text" placeholder="Cerca per username, nome o cognome..." value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl pl-6 pr-16 py-4 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all font-medium" />
              <button type="submit" disabled={searching}
                className="absolute right-2 top-2 bottom-2 bg-primary text-white px-6 rounded-xl hover:bg-primary-hover transition-colors shadow-lg active:scale-95 disabled:opacity-50">
                {searching ? <Loader2 size={18} className="animate-spin" /> : 'Cerca'}
              </button>
            </form>
            <AnimatePresence mode="wait">
              {searchResults.length > 0 ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 gap-4 pt-4">
                  {searchResults.map(p => (
                    <div key={p.id} onClick={() => openProfile(p)}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container border border-primary/5 group hover:bg-white hover:shadow-md transition-all cursor-pointer">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-200 shrink-0">
                        {p.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover" alt={p.username} />
                          : <div className="w-full h-full flex items-center justify-center text-stone-400 bg-stone-100 italic font-serif">{p.username?.[0] || 'U'}</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-primary truncate">{p.name} {p.surname}</h4>
                        <p className="text-xs text-secondary font-mono">@{p.username || 'anon'}</p>
                        {p.favourite_origin && <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-1">Origin: {p.favourite_origin}</p>}
                      </div>
                      <ArrowRight size={18} className="text-stone-400 group-hover:text-secondary transition-colors" />
                    </div>
                  ))}
                </motion.div>
              ) : searchTerm && !searching ? (
                <div className="text-center py-12 text-stone-400 italic">Nessun intenditore trovato per "{searchTerm}"</div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-primary text-white p-8 rounded-3xl shadow-xl space-y-8 relative overflow-hidden">
            <Trophy className="absolute -right-4 -top-4 text-white/5" size={160} />
            <div className="relative z-10">
              <h2 className="text-2xl font-serif italic mb-2">Hall of Fame della Community</h2>
              <p className="text-white/60 text-xs font-bold uppercase tracking-[0.2em] mb-8">Le tavolette più celebrate del momento</p>
              <div className="space-y-6">
                {loadingTop ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-4 animate-pulse">
                      <div className="w-16 h-16 bg-white/10 rounded-xl" />
                      <div className="flex-1 space-y-2"><div className="h-4 bg-white/10 rounded w-2/3" /><div className="h-3 bg-white/10 rounded w-1/3" /></div>
                    </div>
                  ))
                ) : topChocolates.length > 0 ? (
                  topChocolates.map((choco, i) => (
                    <button key={choco.id} onClick={() => navigate(`/chocolate/${choco.id}`)} className="w-full flex items-center gap-4 group text-left">
                      <div className="relative shrink-0">
                        <div className="absolute -left-2 -top-2 w-6 h-6 bg-secondary text-primary font-black text-[10px] flex items-center justify-center rounded-full z-10 shadow-lg">#{i + 1}</div>
                        <img src={choco.imageUrl} className="w-16 h-16 rounded-xl object-cover shadow-lg border border-white/10 group-hover:scale-105 transition-transform" alt="" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif italic text-lg truncate group-hover:text-secondary transition-colors">{choco.name}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1 text-secondary"><Star size={12} className="fill-secondary" /><span className="text-xs font-black">{choco.averageRating.toFixed(1)}</span></div>
                          <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">{choco.ratingCount} Recensioni</span>
                        </div>
                      </div>
                      <ArrowRight size={16} className="text-white/20 group-hover:text-secondary transition-colors" />
                    </button>
                  ))
                ) : <p className="text-white/40 italic text-sm py-4">In attesa delle prime recensioni...</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedUser(null)} className="absolute inset-0 bg-black/50 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
              <div className="bg-primary p-8 text-white relative">
                <button onClick={() => setSelectedUser(null)} className="absolute right-6 top-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors" aria-label="Chiudi"><X size={20} /></button>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white/10 border-2 border-white/20 shrink-0">
                    {selectedUser.avatar_url ? <img src={selectedUser.avatar_url} className="w-full h-full object-cover" alt="" />
                      : <div className="w-full h-full flex items-center justify-center text-3xl font-serif italic text-white/40">{selectedUser.username?.[0]?.toUpperCase()}</div>}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-3xl font-serif italic truncate">{selectedUser.name} {selectedUser.surname}</h3>
                    <p className="text-secondary font-mono text-sm">@{selectedUser.username}</p>
                    <div className="flex gap-4 mt-3">
                      <div className="flex items-center gap-1.5 opacity-80"><Star size={14} className="fill-secondary text-secondary" /><span className="text-xs font-bold">{selectedUserRatings.length} Recensioni</span></div>
                      {selectedUser.favourite_origin && <div className="flex items-center gap-1.5 opacity-80"><MapPin size={14} /><span className="text-xs font-bold">{selectedUser.favourite_origin}</span></div>}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {selectedUser.about_me && (
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Filosofia di Degustazione</h4>
                    <p className="text-stone-600 leading-relaxed italic">"{selectedUser.about_me}"</p>
                  </div>
                )}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-400">Collezione Personale</h4>
                  {loadingRatings ? (
                    <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-secondary" size={32} /></div>
                  ) : selectedUserRatings.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                      {selectedUserRatings.map(rating => {
                        const choco = chocolates.find(c => c.id === String(rating.chocolate_id));
                        if (!choco) return null;
                        return (
                          <button key={rating.id} onClick={() => { navigate(`/chocolate/${choco.id}`); setSelectedUser(null); }}
                            className="bg-stone-50 border border-stone-100 p-3 rounded-2xl flex items-center gap-4 hover:border-secondary/30 transition-all hover:bg-white hover:shadow-sm text-left group">
                            <img src={choco.imageUrl} className="w-12 h-12 rounded-lg object-cover" alt="" />
                            <div className="flex-1 min-w-0">
                              <p className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">{choco.producer}</p>
                              <h5 className="font-serif italic text-primary truncate group-hover:text-secondary transition-colors">{choco.name}</h5>
                            </div>
                            <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-stone-100">
                              <Star size={12} className="fill-secondary text-secondary" /><span className="text-sm font-black">{rating.rating}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : <p className="text-stone-400 italic text-sm py-4">Nessuna recensione ancora pubblicata.</p>}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};