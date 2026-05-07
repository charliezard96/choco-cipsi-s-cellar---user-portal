import React, { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export const AuthCallback: React.FC = () => {
  const [error, setError] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Supabase handles the session exchange automatically if pkce is used or via hash
        // We just need to wait for it or trigger it
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (data.session) {
          setStatus('success');
          // Wait a brief moment to show success state
          setTimeout(() => {
            // We use window.location.href to ensure a clean state
            window.location.href = '/';
          }, 1500);
        } else {
          // If no session, it might still be processing or there was an issue
          const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
              setStatus('success');
              setTimeout(() => {
                window.location.href = '/';
              }, 1500);
              authListener.subscription.unsubscribe();
            }
          });

          // Timeout if nothing happens in 10s
          setTimeout(() => {
            if (status === 'loading') {
              setError('Tempo scaduto per il completamento dell\'autenticazione.');
              setStatus('error');
            }
          }, 10000);
        }
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(err.message || 'Errore durante la finalizzazione dell\'accesso.');
        setStatus('error');
      }
    };

    handleAuthCallback();
  }, []);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-12 text-center border border-stone-100"
      >
        {status === 'loading' && (
          <div className="space-y-6">
            <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping" />
                <div className="relative bg-white rounded-full p-5 shadow-inner flex items-center justify-center">
                    <RefreshCw className="w-10 h-10 text-primary animate-spin" />
                </div>
            </div>
            <div>
                <h2 className="text-2xl font-bold text-primary tracking-tighter mb-2">Finalizzazione Accesso</h2>
                <p className="text-stone-500 text-sm italic">Stiamo sincronizzando la tua biblioteca di DeCacao...</p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
             <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto text-secondary">
               <CheckCircle2 size={40} className="animate-in zoom-in duration-500" />
             </div>
             <div>
                <h2 className="text-2xl font-bold text-primary tracking-tighter mb-2">Benvenuto Conviviale</h2>
                <p className="text-stone-500 text-sm">Accesso completato con successo. Verrai reindirizzato tra un istante.</p>
             </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
             <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto text-error">
               <AlertCircle size={40} />
             </div>
             <div>
                <h2 className="text-2xl font-bold text-primary tracking-tighter mb-2">Ops! Qualcosa è andato storto</h2>
                <p className="text-error text-sm font-medium mb-6 uppercase tracking-widest">{error}</p>
                <button 
                  onClick={() => window.location.href = '/'}
                  className="px-8 py-3 bg-primary text-on-primary rounded-xl font-bold uppercase tracking-widest text-[10px] hover:shadow-lg transition-all"
                >
                  Torna alla Home
                </button>
             </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
