import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { Lock, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';

interface Props {
  onComplete: () => void;
}

export const UpdatePasswordView: React.FC<Props> = ({ onComplete }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { setError('Le password non corrispondono'); return; }

    setLoading(true);
    setError(null);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setSuccess(true);
      setTimeout(onComplete, 3000);
    } catch (err: any) {
      setError(err.message || "Errore durante l'aggiornamento della password");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mb-6 text-secondary">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-3xl font-bold text-primary mb-4">Password Aggiornata</h2>
        <p className="text-stone-500 text-center max-w-md">
          La tua password è stata salvata con successo. Tra pochi istanti verrai reindirizzato all'archivio.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white p-10 rounded-[40px] shadow-sm border border-stone-100">
        <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-8 text-primary">
          <ShieldCheck size={32} />
        </div>
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-primary mb-2">Nuova Password</h2>
          <p className="text-stone-400 text-sm leading-relaxed">Scegli una chiave d'accesso sicura per il tuo profilo da sommelier.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error/5 border border-error/10 rounded-2xl flex items-start gap-3 text-xs font-bold text-error">
            <Lock className="w-4 h-4 mt-0.5 shrink-0" /><span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {[
            { label: 'Password', value: password, setter: setPassword },
            { label: 'Conferma Password', value: confirmPassword, setter: setConfirmPassword },
          ].map(f => (
            <div key={f.label} className="space-y-1.5">
              <label className="text-[10px] font-black text-stone-300 uppercase tracking-widest ml-1">{f.label}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                <input required type="password" placeholder="********"
                  className="w-full bg-stone-50 border border-stone-100 rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-primary placeholder:text-stone-200"
                  value={f.value} onChange={e => f.setter(e.target.value)} />
              </div>
            </div>
          ))}
          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-primary text-on-primary py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50">
            {loading ? <RefreshCw className="animate-spin w-4 h-4" /> : 'Aggiorna Password'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};