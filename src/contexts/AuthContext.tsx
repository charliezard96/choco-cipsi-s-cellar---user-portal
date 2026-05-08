import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface UserProfile {
  uid: string;
  username?: string;
  name?: string;
  surname?: string;
  aboutMe?: string;
  favouriteOrigin?: string;
  photoURL?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type AuthMode = 'login' | 'register' | 'forgot-password';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  showAuthModal: boolean;
  authMode: AuthMode;
  setShowAuthModal: (show: boolean, mode?: AuthMode) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  showAuthModal: false,
  authMode: 'login',
  setShowAuthModal: () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

/* ── Helpers ── */

const mapProfileFromDb = (data: any): UserProfile => ({
  uid: data.id,
  username: data.username || '',
  name: data.name || '',
  surname: data.surname || '',
  aboutMe: data.about_me || '',
  favouriteOrigin: data.favourite_origin || '',
  photoURL: data.avatar_url || '',
  createdAt: data.created_at || '',
  updatedAt: data.updated_at || '',
});

/* ── Provider ── */

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModalState] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  const fetchProfile = useCallback(async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setProfile(mapProfileFromDb(data));
        return;
      }

      // Crea profilo iniziale se non esiste
      const session = await supabase.auth.getSession();
      const currentUser = session.data.session?.user;
      if (!currentUser) return;

      const fullName = currentUser.user_metadata?.full_name || '';
      const [firstName, ...rest] = fullName.split(' ');

      const newRow = {
        id: currentUser.id,
        username: currentUser.email?.split('@')[0] || 'connoisseur',
        name: firstName || '',
        surname: rest.join(' ') || '',
        avatar_url: currentUser.user_metadata?.avatar_url || '',
        updated_at: new Date().toISOString(),
      };

      const { error: insertError } = await supabase.from('profiles').upsert(newRow);
      if (!insertError) setProfile(mapProfileFromDb(newRow));
    } catch (err) {
      console.error('[AuthContext] fetchProfile error:', err);
    }
  }, []);

  useEffect(() => {
    // Gestisci link di conferma scaduti
    const hash = window.location.hash;
    if (hash.includes('error=access_denied') && hash.includes('otp_expired')) {
      alert('Il link di conferma è scaduto o è già stato usato. Richiedi un nuovo link.');
      window.history.replaceState(null, '', window.location.pathname);
    }

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          fetchProfile(session.user.id).catch(console.error);
        }
      } catch (e) {
        console.error('[AuthContext] Session init error:', e);
      } finally {
        setLoading(false);
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        fetchProfile(u.id).catch(console.error);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    // Safety timeout — loading non resta mai bloccato
    const timer = setTimeout(() => setLoading(false), 3000);

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  const handleSetShowAuthModal = useCallback((show: boolean, mode?: AuthMode) => {
    setShowAuthModalState(show);
    if (show && mode) setAuthMode(mode);
  }, []);

  const value = useMemo(() => ({
    user, profile, loading,
    showAuthModal, authMode,
    setShowAuthModal: handleSetShowAuthModal,
    refreshProfile,
  }), [user, profile, loading, showAuthModal, authMode, handleSetShowAuthModal, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};