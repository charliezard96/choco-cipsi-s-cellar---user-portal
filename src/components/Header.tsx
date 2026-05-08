import React from 'react';
import { User, LogOut, LogIn, UserPlus, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: any) => void;
}

const NAV_ITEMS = [
  { key: 'encyclopedia', label: 'Enciclopedia', activeOn: ['encyclopedia', 'detail'] },
  { key: 'producers', label: 'Produttori', activeOn: ['producers', 'producerDetail'] },
  { key: 'tastings', label: 'Degustazioni', activeOn: ['tastings'] },
  { key: 'community', label: 'Community', activeOn: ['community'] },
];

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const { user, profile, setShowAuthModal } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const NavButton: React.FC<{ item: typeof NAV_ITEMS[0] }> = ({ item }) => {
    const isActive = item.activeOn.includes(currentView);
    return (
      <button
        onClick={() => { onNavigate(item.key); setMobileOpen(false); }}
        className={`font-serif text-sm transition-all duration-200 cursor-pointer ${
          isActive
            ? 'text-stone-900 font-bold border-b-2 border-secondary pb-1'
            : 'text-stone-500 font-medium hover:text-stone-800'
        }`}
      >
        {item.label}
      </button>
    );
  };

  return (
    <header className="bg-stone-50 border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-8 h-20 w-full">
        {/* Logo + Nav */}
        <div className="flex items-center gap-12">
          <span
            className="text-xl md:text-2xl font-serif italic text-stone-900 cursor-pointer leading-none flex flex-col"
            onClick={() => onNavigate('encyclopedia')}
            role="button"
            aria-label="Torna alla home"
          >
            <span className="block">The Choco Cipsi's</span>
            <span className="block ml-4 md:ml-6 flex items-center gap-2">
              Cellar
              <svg viewBox="0 0 24 24" className="w-7 h-7 text-secondary fill-secondary/10 rotate-12" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 3c-.5-1-1-1-1.5-1" strokeLinecap="round" />
                <path d="M12 21c-3-0.5-5.5-4-5.5-9s2.5-8.5 5.5-9 5.5 4 5.5 9-2.5 8.5-5.5 9z" />
                <path d="M12 3c-1 0-2 4-2 9s1 9 2 9" />
                <path d="M12 3c1 0 2 4 2 9s-1 9-2 9" />
                <path d="M8.5 5.5c-0.8 1.2-1.2 3.5-1.2 6.5s0.4 5.3 1.2 6.5" />
                <path d="M15.5 5.5c0.8 1.2 1.2 3.5 1.2 6.5s-0.4 5.3-1.2 6.5" />
              </svg>
            </span>
          </span>

          <nav className="hidden md:flex gap-8 items-center h-full">
            {NAV_ITEMS.map(item => <NavButton key={item.key} item={item} />)}
          </nav>
        </div>

        {/* Right side: auth + mobile toggle */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div onClick={() => onNavigate('profile')} className="flex items-center gap-2 cursor-pointer group">
                {profile?.photoURL ? (
                  <img src={profile.photoURL} className="w-8 h-8 rounded-full border border-primary/10 object-cover" alt="Avatar" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <User size={16} />
                  </div>
                )}
                <span className="hidden sm:block text-xs font-bold uppercase tracking-widest text-primary group-hover:text-secondary transition-all">
                  {profile?.name || profile?.username || 'Utente'}
                </span>
              </div>
              <button
                onClick={async () => { await supabase.auth.signOut(); onNavigate('encyclopedia'); }}
                className="p-2 text-stone-500 hover:text-error transition-colors"
                aria-label="Esci"
              >
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setShowAuthModal(true, 'login')}
                className="flex items-center gap-2 px-4 py-2 text-stone-500 hover:text-stone-900 transition-colors text-xs font-bold uppercase tracking-widest"
              >
                <LogIn size={16} /> Accedi
              </button>
              <button
                onClick={() => setShowAuthModal(true, 'register')}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-full text-xs font-bold uppercase tracking-widest hover:shadow-lg transition-all"
              >
                <UserPlus size={16} /> Registrati
              </button>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-stone-600"
            onClick={() => setMobileOpen(prev => !prev)}
            aria-label={mobileOpen ? 'Chiudi menu' : 'Apri menu'}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile nav dropdown */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-stone-200 bg-stone-50 px-8 py-4 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
          {NAV_ITEMS.map(item => <NavButton key={item.key} item={item} />)}
          {!user && (
            <div className="flex gap-2 pt-3 border-t border-stone-100">
              <button onClick={() => { setShowAuthModal(true, 'login'); setMobileOpen(false); }} className="flex-1 py-2 text-xs font-bold uppercase tracking-widest text-stone-500">Accedi</button>
              <button onClick={() => { setShowAuthModal(true, 'register'); setMobileOpen(false); }} className="flex-1 py-2 bg-primary text-on-primary rounded-full text-xs font-bold uppercase tracking-widest">Registrati</button>
            </div>
          )}
        </nav>
      )}
    </header>
  );
};