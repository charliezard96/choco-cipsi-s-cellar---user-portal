import React, { createContext, useContext, useEffect, useState } from 'react';
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
  updatedAt?: any;
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
  refreshProfile: async () => {} 
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  const fetchProfile = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is 'no rows returned'
        throw error;
      }

      if (data) {
        // Map snake_case from DB to camelCase for app
        setProfile({
          uid: data.id,
          username: data.username || '',
          name: data.name || '',
          surname: data.surname || '',
          aboutMe: data.about_me || '',
          favouriteOrigin: data.favourite_origin || '',
          photoURL: data.avatar_url || '',
          updatedAt: data.updated_at
        });
      } else {
        // Create initial profile if it doesn't exist
        const session = await supabase.auth.getSession();
        const currentUser = session.data.session?.user;
        
        if (currentUser) {
          const fullName = currentUser.user_metadata?.full_name || '';
          const nameParts = fullName.split(' ');
          
          const newProfile: UserProfile = {
            uid: currentUser.id,
            username: currentUser.email?.split('@')[0] || 'connoisseur',
            name: nameParts[0] || '',
            surname: nameParts.slice(1).join(' ') || '',
            aboutMe: '',
            favouriteOrigin: '',
            photoURL: currentUser.user_metadata?.avatar_url || '',
            updatedAt: new Date().toISOString()
          };
          
          const { error: insertError } = await supabase
            .from('profiles')
            .upsert({
              id: newProfile.uid,
              username: newProfile.username,
              name: newProfile.name,
              surname: newProfile.surname,
              avatar_url: newProfile.photoURL,
              updated_at: newProfile.updatedAt
            });
            
          if (!insertError) {
            setProfile(newProfile);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  useEffect(() => {
    // Check for errors in URL (e.g. expired confirmation links)
    const hash = window.location.hash;
    if (hash.includes('error=access_denied') && hash.includes('otp_expired')) {
      alert('The confirmation link has expired or has already been used. Please try requesting a new one by signing up again or checking your Supabase settings.');
      window.history.replaceState(null, '', window.location.pathname);
    }

    // Check initial session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          // Fetch profile in parallel, don't wait for it to finish before showing the app
          fetchProfile(session.user.id).catch(e => console.error("Parallel profile fetch error:", e));
        } else {
          setUser(null);
        }
      } catch (e) {
        console.error("Session init error:", e);
      } finally {
        // Always stop loading after a reasonable time (1.5s max for session check)
        setLoading(false);
      }
    };
    
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        const currentUser = session?.user ?? null;
        if (currentUser) {
          setUser(currentUser);
          fetchProfile(currentUser.id).catch(e => console.error("Parallel auth change fetch error:", e));
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (e) {
        console.error("Auth change error:", e);
      } finally {
        setLoading(false);
      }
    });

    // Safety timeout to ensure loading never stays true forever
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = React.useCallback(async () => {
    if (user) await fetchProfile(user.id);
  }, [user]);

  const handleSetShowAuthModal = React.useCallback((show: boolean, mode?: AuthMode) => {
    setShowAuthModal(show);
    if (show && mode) setAuthMode(mode);
  }, []);

  const value = React.useMemo(() => ({
    user,
    profile,
    loading,
    showAuthModal,
    authMode,
    setShowAuthModal: handleSetShowAuthModal,
    refreshProfile
  }), [user, profile, loading, showAuthModal, authMode, handleSetShowAuthModal, refreshProfile]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
