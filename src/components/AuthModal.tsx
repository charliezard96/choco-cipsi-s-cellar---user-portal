import React, { useState, useEffect } from 'react';
import { useAuth, AuthMode } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { authService } from '../services/authService';
import { useAuthSettings } from '../hooks/useAuthSettings';
import { X, LogIn, UserPlus, Shield, Mail, Lock, User, RefreshCw, AlertCircle, Chrome } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AuthModal: React.FC = () => {
  const { showAuthModal, authMode, setShowAuthModal } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { googleEnabled, loading: settingsLoading } = useAuthSettings();

  useEffect(() => {
    if (showAuthModal) setMode(authMode);
  }, [showAuthModal, authMode]);

  if (!showAuthModal) return null;

  const resetForm = () => { setEmail(''); setPassword(''); setDisplayName(''); setError(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'register') {
        const { data, error: err } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: displayName },
          },
        });
        if (err) throw err;
        if (data.session) {
          setShowAuthModal(false);
        } else {
          setError('Registrazione completata! Controlla la tua casella di posta (e lo spam) per il link di conferma.');
        }
      } else if (mode === 'forgot-password') {
        const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/update-password`,
        });
        if (err) throw err;
        setError('Link di reset inviato! Controlla la tua casella di posta.');
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        setShowAuthModal(false);
      }
      if (mode !== 'forgot-password') resetForm();
    } catch (err: any) {
      let msg = err.message || 'Autenticazione fallita';
      if (msg.includes('rate limit')) msg = "Troppe richieste. Attendi un'ora prima di riprovare.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    if (!googleEnabled) return;
    setLoading(true);
    setError(null);
    try {
      await authService.initiateGoogleLogin(`${window.location.origin}/auth-callback`);
    } catch (err: any) {
      setError(err.message || 'Accesso con Google fallito');
      setLoading(false);
    }
  };

  const isSuccess = error?.includes('inviato') || error?.includes('completata');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={() => setShowAuthModal(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative bg-surface w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-primary/10 flex flex-col"
        >
          <div className="p-4 flex justify-end">
            <button onClick={() => setShowAuthModal(false)} className="p-2 hover:bg-surface-container rounded-full transition-colors text-on-surface-variant" aria-label="Chiudi">
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
              {mode === 'login' && 'Accedi per accedere alla tua collezione personale e alle tue valutazioni.'}
              {mode === 'register' && 'Unisciti alla biblioteca per iniziare a curare la tua esperienza con il cioccolato.'}
              {mode === 'forgot-password' && 'Inserisci la tua email per ricevere un link di ripristino della password.'}
            </p>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className={`mb-6 p-4 border rounded-xl flex items-center gap-3 text-xs font-bold text-left ${
                  isSuccess ? 'bg-secondary/10 border-secondary/20 text-secondary' : 'bg-error/10 border-error/20 text-error'
                }`}>
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 mb-8">
              {mode === 'register' && (
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input required type="text" placeholder="Nome Completo"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                    value={displayName} onChange={e => setDisplayName(e.target.value)} />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input required type="email" placeholder="Indirizzo Email"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                  value={email} onChange={e => setEmail(e.target.value)} />
              </div>

              {mode !== 'forgot-password' && (
                <>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input required type="password" placeholder="Password"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                      value={password} onChange={e => setPassword(e.target.value)} />
                  </div>
                  {mode === 'login' && (
                    <div className="flex justify-end px-1">
                      <button type="button" onClick={() => setMode('forgot-password')}
                        className="text-[10px] font-bold text-stone-400 uppercase tracking-widest hover:text-primary transition-colors">
                        Password dimenticata?
                      </button>
                    </div>
                  )}
                </>
              )}

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-primary text-on-primary py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50">
                {loading ? <RefreshCw className="animate-spin w-4 h-4" /> : mode === 'login' ? <LogIn size={18} /> : mode === 'register' ? <UserPlus size={18} /> : <RefreshCw size={18} />}
                {loading ? 'Elaborazione...' : mode === 'login' ? 'Accedi' : mode === 'register' ? 'Crea un Account' : 'Invia Link Reset'}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-200" /></div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-surface text-stone-400 font-bold uppercase tracking-widest">o continua con</span>
              </div>
            </div>

            {/* Google */}
            <div className="space-y-3">
              {googleEnabled === false && !settingsLoading && (
                <p className="text-[10px] text-stone-400 font-medium italic mb-2">L'accesso con Google è temporaneamente disabilitato.</p>
              )}
              <button type="button" onClick={signInWithGoogle}
                disabled={loading || googleEnabled === false || settingsLoading}
                className={`w-full flex items-center justify-center gap-3 border-2 py-3.5 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed ${
                  googleEnabled === false ? 'border-stone-200 text-stone-300' : 'border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white shadow-sm'
                }`}>
                {settingsLoading ? <RefreshCw className="animate-spin w-4 h-4" /> : <Chrome size={18} />}
                {settingsLoading ? 'Controllo impostazioni...' : 'Accedi con Google'}
              </button>
            </div>

            <p className="mt-8 text-xs text-on-surface-variant">
              {mode === 'login' ? 'Non hai un account?' : mode === 'register' ? 'Hai già un account?' : "Torna all'accesso?"}
              <button type="button"
                onClick={() => { if (mode === 'forgot-password') setMode('login'); else { setMode(mode === 'login' ? 'register' : 'login'); resetForm(); } }}
                className="ml-2 font-bold text-primary hover:text-secondary underline underline-offset-4">
                {mode === 'login' ? 'Registrati qui' : 'Accedi qui'}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};