import React, { useState, useEffect } from 'react';
import { useAuth, AuthMode } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { X, LogIn, UserPlus, Shield, Mail, Lock, User, RefreshCw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AuthModal: React.FC = () => {
  const { showAuthModal, authMode, setShowAuthModal } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (showAuthModal) {
      setMode(authMode);
    }
  }, [showAuthModal, authMode]);

  if (!showAuthModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'register') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              full_name: displayName,
            }
          }
        });
        if (signUpError) throw signUpError;
        if (data.user) {
          if (data.session) {
            setShowAuthModal(false);
          } else {
            setError('Registrazione completata! Controlla la tua casella di posta (e lo spam) per il link di conferma. Nota: il link scade velocemente.');
          }
        }
      } else if (mode === 'forgot-password') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: 'https://choco-cipsi-s-cellar-user-portal.vercel.app/update-password',
        });
        if (resetError) throw resetError;
        setError('Link di reset inviato! Controlla la tua casella di posta.');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (signInError) throw signInError;
        setShowAuthModal(false);
      }
      if (mode !== 'forgot-password') {
        resetForm();
      }
    } catch (err: any) {
      console.error(err);
      let userMessage = err.message || 'Autenticazione fallita';
      
      if (userMessage.includes('rate limit')) {
        userMessage = 'Troppe richieste in breve tempo. Per favore, attendi un\'ora prima di riprovare.';
      }
      
      setError(userMessage);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Accesso con Google fallito');
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setError(null);
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    resetForm();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowAuthModal(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative bg-surface w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-primary/10 flex flex-col"
        >
          <div className="p-4 flex justify-end">
            <button 
              onClick={() => setShowAuthModal(false)}
              className="p-2 hover:bg-surface-container rounded-full transition-colors text-on-surface-variant"
            >
              <X size={20} />
            </button>
          </div>

          <div className="px-8 pb-10 text-center overflow-y-auto max-h-[85vh]">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
              <Shield size={32} />
            </div>
            
            <h2 className="text-2xl font-bold text-primary mb-2">
              {mode === 'login' ? 'Bentornato' : mode === 'register' ? 'Crea un Account' : 'Resetta Password'}
            </h2>
            <p className="text-on-surface-variant mb-8 text-sm leading-relaxed">
              {mode === 'login' 
                ? 'Accedi per accedere alla tua collezione personale e alle tue valutazioni.' 
                : mode === 'register'
                  ? 'Unisciti alla biblioteca per iniziare a curare la tua esperienza con il cioccolato.'
                  : 'Inserisci la tua email per ricevere un link di ripristino della password.'}
            </p>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-6 p-4 border rounded-xl flex items-center gap-3 text-xs font-bold text-left ${
                  error.includes('inviato') || error.includes('completata') ? 'bg-secondary/10 border-secondary/20 text-secondary' : 'bg-error/10 border-error/20 text-error'
                }`}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 mb-8">
              {mode === 'register' && (
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input 
                    required
                    type="text"
                    placeholder="Nome Completo"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                  />
                </div>
              )}
              
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input 
                  required
                  type="email"
                  placeholder="Indirizzo Email"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

              {mode !== 'forgot-password' && (
                <>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input 
                      required
                      type="password"
                      placeholder="Password"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                  </div>

                  {mode === 'login' && (
                    <div className="flex justify-end px-1">
                      <button 
                        type="button"
                        onClick={() => setMode('forgot-password')}
                        className="text-[10px] font-bold text-stone-400 uppercase tracking-widest hover:text-primary transition-colors"
                      >
                        Password dimenticata?
                      </button>
                    </div>
                  )}
                </>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-primary text-on-primary py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? <RefreshCw className="animate-spin w-4 h-4" /> : (mode === 'login' ? <LogIn size={18} /> : mode === 'register' ? <UserPlus size={18} /> : <RefreshCw size={18} />)}
                {loading ? 'Elaborazione...' : (mode === 'login' ? 'Accedi' : mode === 'register' ? 'Crea un Account' : 'Invia Link Reset')}
              </button>
            </form>

            <p className="mt-8 text-xs text-on-surface-variant">
              {mode === 'login' ? "Non hai un account?" : mode === 'register' ? "Hai già un account?" : "Torna all'accesso?"}
              <button 
                type="button"
                onClick={() => {
                  if (mode === 'forgot-password') setMode('login');
                  else toggleMode();
                }}
                className="ml-2 font-bold text-primary hover:text-secondary underline underline-offset-4"
              >
                {mode === 'login' ? 'Registrati qui' : 'Accedi qui'}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
