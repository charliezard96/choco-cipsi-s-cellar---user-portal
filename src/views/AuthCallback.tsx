import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

type Status = 'loading' | 'success' | 'error';

export const AuthCallback: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const statusRef = useRef<Status>('loading');

  useEffect(() => {
    const handle = async () => {
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (data.session) {
          setStatus('success');
          statusRef.current = 'success';
          setTimeout(() => { window.location.href = '/'; }, 1500);
          return;
        }

        // Aspetta l'evento SIGNED_IN se la sessione non è ancora pronta
        const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session) {
            setStatus('success');
            statusRef.current = 'success';
            setTimeout(() => { window.location.href = '/'; }, 1500);
            listener.subscription.unsubscribe();
          }
        });

        // Timeout: usa il ref per evitare stale closure
        setTimeout(() => {
          if (statusRef.current === 'loading') {
            setError("Tempo scaduto per il completamento dell'autenticazione.");
            setStatus('error');
          }
        }, 10000);
      } catch (err: any) {
        console.error('[AuthCallback] error:', err);
        setError(err.message || "Errore durante la finalizzazione dell'accesso.");
        setStatus('error');
      }
    };

    handle();
  }, []);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-12 text-center border border-stone-100">

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
              <p className="text-stone-500 text-sm italic">Stiamo sincronizzando la tua biblioteca...</p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto text-secondary">
              <CheckCircle2 size={40} className="animate-in zoom-in duration-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-primary tracking-tighter mb-2">Benvenuto!</h2>
              <p className="text-stone-500 text-sm">Accesso completato. Verrai reindirizzato tra un istante.</p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto text-error">
              <AlertCircle size={40} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-primary tracking-tighter mb-2">Qualcosa è andato storto</h2>
              <p className="text-error text-sm font-medium mb-6 uppercase tracking-widest">{error}</p>
              <button onClick={() => { window.location.href = '/'; }}
                className="px-8 py-3 bg-primary text-on-primary rounded-xl font-bold uppercase tracking-widest text-[10px] hover:shadow-lg transition-all">
                Torna alla Home
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};