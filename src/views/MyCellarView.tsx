import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chocolate, AromaProfile } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { profileService } from '../services/profileService';
import { ratingService } from '../services/ratingService';
import { aromaService } from '../services/aromaService';
import { cellarService } from '../services/cellarService';
import { getIconHelper } from '../utils/iconUtils';
import { getAromaColors } from '../utils/colorUtils';
import {
  Fingerprint, Search, Star, BookOpen, RefreshCw, X,
  SortAsc, NotebookPen, ArrowRight, AlignLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  chocolates: Chocolate[];
}

type SortKey = 'name' | 'rating' | 'votes';

interface NoteModal {
  barId: number;
  barName: string;
  currentNote: string;
}

export const MyCellarView: React.FC<Props> = ({ chocolates }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [aromaProfiles, setAromaProfiles] = useState<AromaProfile[]>([]);
  const [aromaVotes, setAromaVotes] = useState<any[]>([]);
  const [ratings, setRatings] = useState<any[]>([]);
  const [notes, setNotes] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('name');

  const [noteModal, setNoteModal] = useState<NoteModal | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      profileService.fetchUserAromaVotes(user.id),
      ratingService.fetchUserRatings(user.id),
      aromaService.fetchProfiles(),
      cellarService.fetchUserNotes(user.id),
    ]).then(([votes, rats, profiles, userNotes]) => {
      setAromaVotes(votes);
      setRatings(rats);
      setAromaProfiles(profiles);
      setNotes(new Map(userNotes.map(n => [n.bar_id, n.note])));
    }).catch(console.error).finally(() => setLoading(false));
  }, [user]);

  const entries = useMemo(() => {
    const votesByChoco: Record<string, any[]> = {};
    aromaVotes.forEach(v => { (votesByChoco[v.chocolate_id] ||= []).push(v); });

    const ratingByChoco: Record<string, number> = {};
    ratings.forEach(r => { ratingByChoco[String(r.chocolate_id)] = r.rating; });

    const allIds = new Set([
      ...Object.keys(votesByChoco),
      ...Object.keys(ratingByChoco),
    ]);

    return Array.from(allIds)
      .map(id => ({
        chocolateId: id,
        chocolate: chocolates.find(c => c.id === id),
        votes: votesByChoco[id] || [],
        rating: ratingByChoco[id] || null,
        note: notes.get(Number(id)) || null,
      }))
      .filter(e => e.chocolate);
  }, [aromaVotes, ratings, chocolates, notes]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return entries
      .filter(e => !term ||
        e.chocolate!.name.toLowerCase().includes(term) ||
        e.chocolate!.producer.toLowerCase().includes(term)
      )
      .sort((a, b) => {
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'votes') return b.votes.length - a.votes.length;
        return (a.chocolate!.name || '').localeCompare(b.chocolate!.name || '');
      });
  }, [entries, search, sortBy]);

  const openNoteModal = (barId: number, barName: string) => {
    setNoteModal({ barId, barName, currentNote: notes.get(barId) || '' });
    setNoteDraft(notes.get(barId) || '');
  };

  const handleSaveNote = async () => {
    if (!user || !noteModal) return;
    setSavingNote(true);
    try {
      await cellarService.saveNote(user.id, noteModal.barId, noteDraft);
      setNotes(prev => new Map(prev).set(noteModal.barId, noteDraft));
      setNoteModal(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingNote(false);
    }
  };

  if (!user) return (
    <div className="text-center py-20">
      <Fingerprint size={48} className="mx-auto text-stone-200 mb-4" />
      <p className="text-stone-400 font-bold uppercase tracking-widest text-xs">Accedi per vedere la tua cantina</p>
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <RefreshCw size={28} className="animate-spin text-secondary" />
    </div>
  );

  return (
    <div className="animate-in fade-in duration-700 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <Fingerprint size={28} className="text-secondary" />
          <h1 className="text-3xl font-bold text-primary">La Mia Cantina</h1>
          <span className="ml-2 bg-secondary/10 text-secondary text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
            {entries.length} tavolette
          </span>
        </div>
        <p className="text-xs text-on-surface-variant font-medium ml-10">
          Il tuo archivio personale — voti aromatici, stelle e note private.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={16} />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cerca per nome o produttore..."
            className="w-full bg-white border border-stone-200 rounded-2xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-500">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-2xl px-4 py-3 shrink-0">
          <SortAsc size={15} className="text-stone-400" />
          <select value={sortBy} onChange={e => setSortBy(e.target.value as SortKey)}
            className="text-xs font-bold text-stone-600 bg-transparent outline-none cursor-pointer">
            <option value="name">Nome</option>
            <option value="rating">Stelle</option>
            <option value="votes">Note aromatiche</option>
          </select>
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="py-24 text-center border border-dashed border-stone-200 rounded-3xl">
          <Fingerprint size={48} className="mx-auto text-stone-100 mb-4" />
          <p className="text-sm font-bold text-stone-400 uppercase tracking-widest">
            {search ? 'Nessuna tavoletta trovata' : 'La tua cantina è vuota'}
          </p>
          {!search && (
            <button onClick={() => navigate('/')} className="mt-4 text-xs font-bold text-secondary uppercase tracking-widest hover:opacity-70 transition-opacity">
              Esplora l'enciclopedia →
            </button>
          )}
        </div>
      )}

      {/* Entries */}
      <div className="space-y-4">
        {filtered.map(entry => {
          const choco = entry.chocolate!;
          const visibleVotes = entry.votes.slice(0, 4);
          const overflow = entry.votes.length - visibleVotes.length;
          const note = entry.note;

          return (
            <motion.div key={entry.chocolateId}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-stone-100 rounded-3xl p-5 shadow-sm hover:border-secondary/20 transition-all">
              <div className="flex gap-4">
                {/* Thumbnail */}
                <button onClick={() => navigate(`/chocolate/${entry.chocolateId}`)} className="shrink-0">
                  <img src={choco.imageUrl} alt={choco.name}
                    className="w-20 h-20 rounded-2xl object-cover bg-stone-100 hover:scale-105 transition-transform shadow-sm" />
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="min-w-0">
                      <span className="text-[9px] font-black text-secondary uppercase tracking-widest block">{choco.producer}</span>
                      <h3 className="font-bold text-primary text-sm leading-tight truncate">{choco.name}</h3>
                    </div>
                    {/* Stars */}
                    {entry.rating && (
                      <div className="flex items-center gap-1 bg-stone-50 border border-stone-100 px-2.5 py-1 rounded-full shrink-0">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} size={10} className={s <= entry.rating! ? 'text-secondary fill-secondary' : 'text-stone-200'} />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Aroma chips */}
                  {entry.votes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {visibleVotes.map(v => {
                        const p = aromaProfiles.find(ap => ap.id === v.aroma_id);
                        if (!p) return null;
                        const Icon = getIconHelper(p.icon_slug, p.group_name);
                        const colors = getAromaColors(p.hex_color);
                        return (
                          <div key={v.id} className="flex items-center gap-1 px-2.5 py-1 rounded-full border"
                            style={{ backgroundColor: colors.bg, borderColor: colors.border }}>
                            <Icon size={10} color={colors.fg} />
                            <span className="text-[9px] font-black uppercase tracking-wide" style={{ color: colors.fg }}>{p.name}</span>
                          </div>
                        );
                      })}
                      {overflow > 0 && (
                        <span className="text-[9px] font-bold text-stone-400 self-center">+{overflow}</span>
                      )}
                    </div>
                  )}

                  {/* Personal note preview */}
                  {note && (
                    <p className="mt-2 text-[11px] text-stone-500 italic line-clamp-1 flex items-center gap-1.5">
                      <AlignLeft size={10} className="text-stone-300 shrink-0" />
                      {note}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={() => openNoteModal(Number(entry.chocolateId), choco.name)}
                      className="flex items-center gap-1.5 text-[10px] font-bold text-stone-400 hover:text-secondary transition-colors uppercase tracking-widest">
                      <NotebookPen size={12} />
                      {note ? 'Modifica nota' : 'Aggiungi nota'}
                    </button>
                    <span className="text-stone-200">·</span>
                    <button
                      onClick={() => navigate(`/chocolate/${entry.chocolateId}`)}
                      className="flex items-center gap-1 text-[10px] font-bold text-stone-400 hover:text-primary transition-colors uppercase tracking-widest">
                      Scheda <ArrowRight size={11} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Note modal */}
      <AnimatePresence>
        {noteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setNoteModal(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <button onClick={() => setNoteModal(null)} className="absolute top-5 right-5 p-2 hover:bg-stone-100 rounded-full text-stone-400"><X size={18} /></button>
              <div className="flex items-center gap-2 mb-6">
                <NotebookPen size={18} className="text-secondary" />
                <div>
                  <h3 className="text-xs font-black text-primary uppercase tracking-widest">Nota Personale</h3>
                  <p className="text-[10px] text-stone-400 font-bold truncate max-w-[240px]">{noteModal.barName}</p>
                </div>
              </div>
              <textarea
                rows={5}
                value={noteDraft}
                onChange={e => setNoteDraft(e.target.value)}
                placeholder="Le tue impressioni personali, abbinamenti, momenti... Solo tu la vedi."
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all resize-none font-medium"
                autoFocus
              />
              <div className="flex gap-3 mt-4">
                <button onClick={() => setNoteModal(null)}
                  className="flex-1 py-3 rounded-xl border border-stone-200 text-xs font-bold text-stone-500 hover:bg-stone-50 transition-colors uppercase tracking-widest">
                  Annulla
                </button>
                <button onClick={handleSaveNote} disabled={savingNote}
                  className="flex-1 py-3 rounded-xl bg-primary text-on-primary text-xs font-bold uppercase tracking-widest hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {savingNote ? <RefreshCw size={14} className="animate-spin" /> : <BookOpen size={14} />}
                  Salva
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
