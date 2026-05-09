import React, { useState, useMemo } from 'react';
import { Search, ChevronRight, ChevronLeft, Check, RefreshCw, X } from 'lucide-react';
import { AromaProfile, NoteVote } from '../types';
import { getIconHelper } from '../utils/iconUtils';
import { getAromaColors, ensureVisible } from '../utils/colorUtils';

interface AromaVotingProps {
  chocolateId: string;
  profiles: AromaProfile[];
  votes: NoteVote[];
  onVote: (aromaId: string) => Promise<void>;
  userId?: string;
}

export const AromaVoting: React.FC<AromaVotingProps> = ({ profiles, votes, onVote, userId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentGroup, setCurrentGroup] = useState<string | null>(null);
  const [currentSubgroup, setCurrentSubgroup] = useState<string | null>(null);
  const [votingId, setVotingId] = useState<string | null>(null);

  const groups = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    profiles.forEach(p => {
      if (!map[p.group_name]) map[p.group_name] = new Set();
      if (p.subgroup_name) map[p.group_name].add(p.subgroup_name);
    });
    return map;
  }, [profiles]);

  const searchResults = useMemo(() => {
    if (searchTerm.length < 2) return [];
    const term = searchTerm.toLowerCase();
    return profiles
      .filter(p => p.name.toLowerCase().includes(term) || p.group_name.toLowerCase().includes(term))
      .slice(0, 10);
  }, [searchTerm, profiles]);

  const handleToggleVote = async (aromaId: string) => {
    setVotingId(aromaId);
    try { await onVote(aromaId); } finally { setVotingId(null); }
  };

  const renderNote = (p: AromaProfile) => {
    const vote = votes.find(v => v.aroma_id === p.id);
    const IconComp = getIconHelper(p.icon_slug, p.group_name);
    const colors = getAromaColors(p.hex_color);
    const isVoted = vote?.user_voted;
    const isProcessing = votingId === p.id;

    return (
      <button key={p.id} onClick={() => handleToggleVote(p.id)}
        disabled={isProcessing || !userId}
        className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left group ${
          isVoted ? 'bg-white border-secondary shadow-md ring-1 ring-secondary/20' : 'bg-stone-50 border-stone-100 hover:border-primary/20'
        }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center transition-transform group-active:scale-90"
            style={{ backgroundColor: colors.bg }}>
            {isProcessing ? <RefreshCw size={16} className="animate-spin text-stone-400" /> : <IconComp size={20} color={colors.fg} />}
          </div>
          <div>
            <span className="text-[11px] font-black text-primary uppercase tracking-wider block">{p.name}</span>
            {vote && vote.count > 0 && <span className="text-[10px] text-stone-400 font-bold">{vote.count} riscontri</span>}
          </div>
        </div>
        {isVoted && <Check size={16} className="text-secondary stroke-[3]" />}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <div className="relative">
          <input type="text" placeholder="Cerca una nota specifica..." value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-stone-200 rounded-2xl pl-12 pr-10 py-4 focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-sm" />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={20} />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300 hover:text-primary" aria-label="Cancella ricerca">
              <X size={18} />
            </button>
          )}
        </div>

        {searchResults.length > 0 && (
          <div className="absolute z-30 left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-stone-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
            <div className="p-2 space-y-1">
              {searchResults.map(p => {
                const Icon = getIconHelper(p.icon_slug, p.group_name);
                const colors = getAromaColors(p.hex_color);
                return (
                  <button key={p.id}
                    onClick={() => { handleToggleVote(p.id); setSearchTerm(''); }}
                    className="w-full flex items-center justify-between p-3 hover:bg-stone-50 rounded-xl transition-colors text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.bg }}>
                        <Icon size={14} color={colors.fg} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-primary uppercase tracking-wider">{p.name}</p>
                        <p className="text-[9px] text-stone-400 font-bold uppercase tracking-widest">{p.group_name} / {p.subgroup_name}</p>
                      </div>
                    </div>
                    {votes.find(v => v.aroma_id === p.id)?.user_voted && <Check size={14} className="text-secondary" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Breadcrumbs */}
      {(currentGroup || currentSubgroup) && !searchTerm && (
        <div className="flex items-center gap-2">
          <button onClick={() => { if (currentSubgroup) setCurrentSubgroup(null); else setCurrentGroup(null); }}
            className="flex items-center gap-1 text-[10px] font-black text-secondary uppercase tracking-[0.2em] hover:opacity-70 transition-opacity">
            <ChevronLeft size={14} /> Indietro
          </button>
          <span className="text-[10px] text-stone-300 font-bold uppercase tracking-widest">
            / {currentGroup} {currentSubgroup && `/ ${currentSubgroup}`}
          </span>
        </div>
      )}

      {/* Grid */}
      {!searchTerm && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!currentGroup && Object.keys(groups).sort().map(group => (
            <button key={group} onClick={() => setCurrentGroup(group)}
              className="flex items-center justify-between p-6 bg-white border border-stone-100 rounded-3xl hover:border-primary/20 hover:shadow-lg transition-all group text-left">
              <span className="text-sm font-black text-primary uppercase tracking-[0.15em]">{group}</span>
              <ChevronRight size={18} className="text-stone-300 group-hover:translate-x-1 transition-transform" />
            </button>
          ))}

          {currentGroup && !currentSubgroup && Array.from(groups[currentGroup]).sort().map(sub => (
            <button key={sub} onClick={() => setCurrentSubgroup(sub)}
              className="flex items-center justify-between p-6 bg-white border border-stone-100 rounded-3xl hover:border-secondary/20 hover:shadow-lg transition-all group text-left">
              <span className="text-sm font-black text-primary uppercase tracking-[0.15em]">{sub}</span>
              <ChevronRight size={18} className="text-secondary group-hover:translate-x-1 transition-transform" />
            </button>
          ))}

          {currentGroup && currentSubgroup &&
            profiles
              .filter(p => p.group_name === currentGroup && p.subgroup_name === currentSubgroup)
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(renderNote)
          }
        </div>
      )}

      {!userId && (
        <div className="text-center p-8 bg-stone-100 rounded-3xl border border-dashed border-stone-200">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Accedi per partecipare al voto sensoriale</p>
        </div>
      )}
    </div>
  );
};