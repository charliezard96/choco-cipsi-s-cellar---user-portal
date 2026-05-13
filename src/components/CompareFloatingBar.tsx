import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, GitCompare, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Chocolate } from '../types';
import { useCompare } from '../contexts/CompareContext';

interface Props {
  chocolates: Chocolate[];
}

export const CompareFloatingBar: React.FC<Props> = ({ chocolates }) => {
  const { compareList, toggleCompare, clearCompare } = useCompare();
  const navigate = useNavigate();

  const selected = compareList.map(id => chocolates.find(c => c.id === id)).filter(Boolean) as Chocolate[];

  return (
    <AnimatePresence>
      {compareList.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4">
          <div className="bg-primary text-on-primary rounded-2xl shadow-2xl px-5 py-4 flex items-center gap-4">
            <GitCompare size={18} className="text-secondary shrink-0" />
            <div className="flex-1 flex items-center gap-3 min-w-0">
              {selected.map(c => (
                <div key={c.id} className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-1.5 min-w-0">
                  <img src={c.imageUrl} alt={c.name} className="w-6 h-6 rounded-lg object-cover shrink-0" />
                  <span className="text-xs font-bold truncate">{c.name}</span>
                  <button onClick={() => toggleCompare(c.id)} className="text-white/50 hover:text-white transition-colors shrink-0">
                    <X size={12} />
                  </button>
                </div>
              ))}
              {compareList.length < 2 && (
                <span className="text-xs text-white/40 font-medium italic">Aggiungi un'altra tavoletta</span>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={clearCompare} className="text-[10px] font-bold text-white/50 hover:text-white uppercase tracking-widest transition-colors">
                Annulla
              </button>
              {compareList.length >= 2 && (
                <button onClick={() => { navigate(`/compare?a=${compareList[0]}&b=${compareList[1]}`); }}
                  className="flex items-center gap-1.5 bg-secondary text-primary px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-opacity">
                  Confronta <ArrowRight size={13} />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
