import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Star, Users, LogIn, UserPlus, ArrowRight, Fingerprint, Wine } from 'lucide-react';
import { Chocolate, Producer } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { ratingService } from '../services/ratingService';
import { profileService } from '../services/profileService';
import { aromaService } from '../services/aromaService';

interface Props {
  chocolates: Chocolate[];
  producers: Producer[];
}

interface UserStats {
  ratings: number;
  aromaVotes: number;
}

interface TopBar {
  chocolate: Chocolate;
  count: number;
}

export const HomeView: React.FC<Props> = ({ chocolates, producers }) => {
  usePageMeta(undefined, 'L\'archivio digitale del cioccolato fine. Scopri, degusta, confronta.');
  const navigate = useNavigate();
  const { user, profile, setShowAuthModal } = useAuth();

  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [topBars, setTopBars] = useState<TopBar[]>([]);

  /* ── Fetch data ── */
  useEffect(() => {
    ratingService.fetchAllRatings().then(all => {
      const counts: Record<string, number> = {};
      all.forEach(r => { counts[r.chocolate_id] = (counts[r.chocolate_id] || 0) + 1; });
      const top = Object.entries(counts)
        .map(([id, count]) => {
          const choco = chocolates.find(c => c.id === String(id));
          if (!choco || count < 1) return null;
          return { chocolate: choco, count };
        })
        .filter((x): x is TopBar => x !== null)
        .sort((a, b) => b.count - a.count)
        .slice(0, 4);
      setTopBars(top);
    }).catch(console.error);
  }, [chocolates]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      ratingService.fetchUserRatings(user.id),
      profileService.fetchUserAromaVotes(user.id),
    ]).then(([ratings, votes]) => {
      setUserStats({ ratings: ratings.length, aromaVotes: votes.length });
    }).catch(console.error);
  }, [user]);

  /* ── LOGGED OUT ── */
  if (!user) {
    return (
      <div className="animate-in fade-in duration-700">
        {/* Hero */}
        <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=1800&auto=format&fit=crop"
            className="absolute inset-0 w-full h-full object-cover"
            alt=""
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/60 to-primary/80" />

          <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
            <span className="text-[10px] font-black text-secondary-container uppercase tracking-[0.4em] mb-6 block">
              L'Archivio del Cioccolato Fine
            </span>
            <h1 className="text-5xl md:text-7xl font-serif italic text-white leading-tight mb-6">
              Ogni tavoletta racconta<br />una storia.
            </h1>
            <p className="text-white/70 text-lg mb-12 max-w-xl mx-auto leading-relaxed">
              DeCacao Cellar è l'enciclopedia personale del cioccolato fondente di qualità. Cataloga, annota, confronta, degusta.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowAuthModal(true, 'register')}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-secondary text-primary rounded-full font-black text-xs uppercase tracking-widest hover:shadow-2xl hover:shadow-secondary/30 transition-all active:scale-95">
                <UserPlus size={16} /> Inizia Gratis
              </button>
              <button
                onClick={() => setShowAuthModal(true, 'login')}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-full font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all">
                <LogIn size={16} /> Accedi
              </button>
            </div>
          </div>

          {/* Scroll hint */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30">
            <div className="w-px h-12 bg-gradient-to-b from-white/0 to-white/30 animate-pulse" />
          </div>
        </section>

        {/* Stats */}
        <section className="bg-primary text-white py-16 px-4 md:px-8">
          <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
            {[
              { n: chocolates.length, label: 'Tavolette catalogate', icon: Fingerprint },
              { n: producers.length, label: 'Produttori', icon: Wine },
              { n: '∞', label: 'Storie da scoprire', icon: BookOpen },
            ].map(({ n, label, icon: Icon }) => (
              <div key={label}>
                <Icon size={20} className="text-secondary mx-auto mb-3 opacity-70" />
                <div className="text-4xl font-serif italic font-bold text-secondary mb-1">{n}</div>
                <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Top rated preview */}
        {topBars.length > 0 && (
          <section className="py-20 px-4 md:px-8 bg-surface">
            <div className="max-w-5xl mx-auto">
              <p className="text-[10px] font-black text-secondary uppercase tracking-[0.4em] mb-3 text-center">Community</p>
              <h2 className="text-3xl font-serif italic text-primary text-center mb-12">Le più celebrate</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {topBars.map(({ chocolate, count }, i) => (
                  <div key={chocolate.id} className="group relative">
                    <div className="absolute -top-3 -left-2 z-10 w-7 h-7 bg-secondary text-primary font-black text-[10px] flex items-center justify-center rounded-full shadow-lg">
                      #{i + 1}
                    </div>
                    <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-stone-100 mb-3">
                      <img src={chocolate.imageUrl} alt={chocolate.name} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <span className="text-[9px] font-black text-secondary uppercase tracking-widest block">{chocolate.producer}</span>
                    <span className="text-sm font-bold text-primary leading-tight block">{chocolate.name}</span>
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1 block">
                      {count} {count === 1 ? 'valutazione' : 'valutazioni'}
                    </span>
                  </div>
                ))}
              </div>
              <div className="text-center mt-12">
                <button
                  onClick={() => setShowAuthModal(true, 'register')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full text-xs font-black uppercase tracking-widest hover:shadow-xl transition-all">
                  Accedi per esplorare <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    );
  }

  /* ── LOGGED IN — Dashboard ── */
  const firstName = profile?.name || profile?.username || 'Intenditore';

  return (
    <div className="animate-in fade-in duration-700 max-w-5xl mx-auto px-6 md:px-8 py-12">
      {/* Welcome */}
      <section className="mb-12">
        <span className="text-[10px] font-black text-secondary uppercase tracking-[0.4em] block mb-2">Bentornato</span>
        <h1 className="text-4xl font-serif italic text-primary">{firstName}</h1>
      </section>

      {/* User stat chips */}
      {userStats && (
        <div className="flex flex-wrap gap-4 mb-12">
          <div className="flex items-center gap-3 bg-white border border-stone-100 rounded-2xl px-5 py-3 shadow-sm">
            <Star size={16} className="text-secondary" />
            <div>
              <div className="text-xs font-black text-primary">{userStats.ratings}</div>
              <div className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Valutazioni</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white border border-stone-100 rounded-2xl px-5 py-3 shadow-sm">
            <Fingerprint size={16} className="text-secondary" />
            <div>
              <div className="text-xs font-black text-primary">{userStats.aromaVotes}</div>
              <div className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Note Aromatiche</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white border border-stone-100 rounded-2xl px-5 py-3 shadow-sm">
            <BookOpen size={16} className="text-secondary" />
            <div>
              <div className="text-xs font-black text-primary">{chocolates.length}</div>
              <div className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">In archivio</div>
            </div>
          </div>
        </div>
      )}

      {/* Quick access */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
        {[
          {
            label: 'Enciclopedia',
            desc: `${chocolates.length} tavolette catalogate`,
            path: '/encyclopedia',
            icon: BookOpen,
            dark: true,
          },
          {
            label: 'La Mia Cantina',
            desc: 'Note e valutazioni personali',
            path: '/my-cellar',
            icon: Wine,
            dark: false,
          },
          {
            label: 'Community',
            desc: 'Degustatori e classifiche',
            path: '/community',
            icon: Users,
            dark: false,
          },
        ].map(({ label, desc, path, icon: Icon, dark }) => (
          <button key={path} onClick={() => navigate(path)}
            className={`group p-6 rounded-2xl border text-left flex flex-col gap-3 hover:shadow-lg transition-all ${
              dark ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-stone-100'
            }`}>
            <Icon size={20} className={dark ? 'text-secondary' : 'text-secondary'} />
            <div>
              <div className={`font-bold text-sm mb-0.5 ${dark ? 'text-white' : 'text-primary'}`}>{label}</div>
              <div className={`text-[10px] font-medium ${dark ? 'text-white/50' : 'text-stone-400'}`}>{desc}</div>
            </div>
            <ArrowRight size={14} className={`mt-auto ${dark ? 'text-secondary' : 'text-secondary'} group-hover:translate-x-1 transition-transform`} />
          </button>
        ))}
      </section>

      {/* Top rated */}
      {topBars.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-primary">Top Rated dalla Community</h2>
            <button onClick={() => navigate('/community')} className="text-[10px] font-black text-secondary uppercase tracking-widest hover:opacity-70 transition-opacity">
              Vedi tutto →
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {topBars.map(({ chocolate, count }, i) => (
              <button key={chocolate.id} onClick={() => navigate(`/chocolate/${chocolate.slug}`)}
                className="group text-left relative">
                <div className="absolute -top-3 -left-2 z-10 w-7 h-7 bg-secondary text-primary font-black text-[10px] flex items-center justify-center rounded-full shadow-lg">
                  #{i + 1}
                </div>
                <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-stone-100 mb-3">
                  <img src={chocolate.imageUrl} alt={chocolate.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                </div>
                <span className="text-[9px] font-black text-secondary uppercase tracking-widest block">{chocolate.producer}</span>
                <span className="text-sm font-bold text-primary leading-tight block">{chocolate.name}</span>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1 block">
                  {count} {count === 1 ? 'valutazione' : 'valutazioni'}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
