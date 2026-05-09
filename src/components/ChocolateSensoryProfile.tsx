import React, { useState, useEffect, useMemo } from 'react';
import { Fingerprint, Users, RefreshCw } from 'lucide-react';
import { AromaProfile } from '../types';
import { aromaService } from '../services/aromaService';
import { getIconHelper } from '../utils/iconUtils';
import { getAromaColors } from '../utils/colorUtils';

interface Props {
  chocolateId: string;
  userId?: string;
  profiles: AromaProfile[];
  refreshTrigger?: number;
}

interface CommunityStat {
  aroma_id: string;
  count: number;
  percentage: number;
}

export const ChocolateSensoryProfile: React.FC<Props> = ({ chocolateId, userId, profiles, refreshTrigger }) => {
  const [loading, setLoading] = useState(true);
  const [userVotes, setUserVotes] = useState<string[]>([]);
  const [communityStats, setCommunityStats] = useState<CommunityStat[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Usa il service layer (prima era una query diretta nel componente)
      const [uVotes, stats] = await Promise.all([
        userId ? aromaService.fetchUserVotes(userId, chocolateId) : Promise.resolve([]),
        aromaService.fetchCommunityStats(chocolateId),
      ]);
      setUserVotes(uVotes);
      setCommunityStats(stats);
    } catch (e) {
      console.error('[SensoryProfile] fetchData error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [chocolateId, userId, refreshTrigger]);

  const topAromas = useMemo(() => communityStats, [communityStats]);

  if (loading && communityStats.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-4 text-stone-300">
        <RefreshCw className="animate-spin" size={32} />
        <span className="text-[10px] font-bold uppercase tracking-widest">Sincronizzazione archivio...</span>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* User Section */}
      {userId && (
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Fingerprint size={18} className="text-secondary" />
            <h4 className="text-sm font-bold text-primary uppercase tracking-widest">La Tua Impronta Sensoriale</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {userVotes.length > 0 ? (
              userVotes.map(id => {
                const profile = profiles.find(p => p.id === id);
                if (!profile) return null;
                const Icon = getIconHelper(profile.icon_slug, profile.group_name);
                const colors = getAromaColors(profile.hex_color);
                return (
                  <div key={id} className="flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm animate-in fade-in zoom-in duration-300"
                    style={{ backgroundColor: colors.bg, borderColor: colors.border }}>
                    <Icon size={14} color={colors.fg} />
                    <span className="text-[10px] font-black uppercase tracking-wider text-primary">{profile.name}</span>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-stone-400 italic">Devi ancora votare le note aromatiche di questa tavoletta.</p>
            )}
          </div>
        </section>
      )}

      {/* Community Section */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-secondary" />
            <h4 className="text-sm font-bold text-primary uppercase tracking-widest">Verdetto della Community</h4>
          </div>
          <button onClick={fetchData} className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-primary" aria-label="Aggiorna dati">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {topAromas.length > 0 ? (
          <div className="space-y-12">
            {/* Top 5 */}
            <div className="space-y-6">
              <p className="text-[10px] font-black text-secondary/40 uppercase tracking-[0.2em] mb-4">I Fantastici Cinque</p>
              {topAromas.slice(0, 5).map((stat, index) => {
                const profile = profiles.find(p => p.id === stat.aroma_id);
                if (!profile) return null;
                const Icon = getIconHelper(profile.icon_slug, profile.group_name);
                const colors = getAromaColors(profile.hex_color);
                return (
                  <div key={stat.aroma_id} className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px] text-stone-300">0{index + 1}</span>
                        <div className="flex items-center gap-2">
                          <Icon size={16} color={colors.fg} />
                          <span className="font-black text-primary uppercase tracking-wider">{profile.name}</span>
                        </div>
                      </div>
                      <span className="font-bold text-secondary">{Math.round(stat.percentage)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${stat.percentage}%`, backgroundColor: colors.fg }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Others */}
            {topAromas.length > 5 && (
              <div className="space-y-6">
                <p className="text-[10px] font-black text-stone-300 uppercase tracking-[0.2em] mb-4">Altre Sfumature Emerse</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  {topAromas.slice(5).map(stat => {
                    const profile = profiles.find(p => p.id === stat.aroma_id);
                    if (!profile) return null;
                    const Icon = getIconHelper(profile.icon_slug, profile.group_name);
                    const colors = getAromaColors(profile.hex_color);
                    return (
                      <div key={stat.aroma_id} className="space-y-2">
                        <div className="flex items-center justify-between text-[10px]">
                          <div className="flex items-center gap-2">
                            <Icon size={14} color={colors.fg} />
                            <span className="font-bold text-primary uppercase tracking-wider">{profile.name}</span>
                          </div>
                          <span className="font-bold text-stone-500">{Math.round(stat.percentage)}%</span>
                        </div>
                        <div className="h-1 w-full bg-stone-50 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${stat.percentage}%`, backgroundColor: colors.fg }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="col-span-full text-center py-12 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
            <Fingerprint size={48} className="text-stone-100 mx-auto mb-4" />
            <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">Ancora nessun dato comunitario per questa tavoletta.</p>
          </div>
        )}
      </section>
    </div>
  );
};