import React, { useState, useEffect, useMemo } from 'react';
import { Fingerprint, Users, RefreshCw } from 'lucide-react';
import { AromaProfile } from '../types';
import { aromaService } from '../services/aromaService';
import { getIconHelper } from '../utils/iconUtils';
import { getAromaColors } from '../utils/colorUtils';
import { supabase } from '../lib/supabase';

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

/** Group profiles by group_name, returning sorted family entries. */
function groupByFamily<T extends { aroma_id?: string; id?: string }>(
  items: T[],
  profiles: AromaProfile[],
  getId: (item: T) => string,
) {
  const map = new Map<string, { hex_color: string | null; icon_slug: string | null; items: T[] }>();
  items.forEach(item => {
    const profile = profiles.find(p => p.id === getId(item));
    if (!profile) return;
    const key = profile.group_name;
    if (!map.has(key)) {
      const rep = profiles.find(p => p.group_name === key);
      map.set(key, { hex_color: rep?.hex_color ?? null, icon_slug: rep?.icon_slug ?? null, items: [] });
    }
    map.get(key)!.items.push(item);
  });
  return Array.from(map.entries()).map(([groupName, data]) => ({ groupName, ...data }));
}

export const ChocolateSensoryProfile: React.FC<Props> = ({ chocolateId, userId, profiles, refreshTrigger }) => {
  const [loading, setLoading] = useState(true);
  const [userVotes, setUserVotes] = useState<string[]>([]);
  const [communityStats, setCommunityStats] = useState<CommunityStat[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
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

  useEffect(() => {
    const channel = supabase
      .channel(`sensory-profile-${chocolateId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'aroma_votes',
        filter: `chocolate_id=eq.${chocolateId}`,
      }, () => { fetchData(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [chocolateId]);

  const userFamilies = useMemo(() =>
    groupByFamily(
      userVotes.map(id => ({ id })),
      profiles,
      item => item.id,
    ),
    [userVotes, profiles],
  );

  const communityFamilies = useMemo(() =>
    groupByFamily(communityStats, profiles, s => s.aroma_id),
    [communityStats, profiles],
  );

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
          {userVotes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {userFamilies.map(({ groupName, hex_color, icon_slug, items }) => {
                const groupColors = getAromaColors(hex_color);
                const GroupIcon = getIconHelper(icon_slug, groupName);
                return (
                  <div key={groupName} className="rounded-2xl border overflow-hidden shadow-sm" style={{ borderColor: groupColors.border }}>
                    <div className="flex items-center gap-2.5 px-5 py-3.5" style={{ backgroundColor: groupColors.bg }}>
                      <GroupIcon size={15} strokeWidth={2.5} color={groupColors.fg} />
                      <span className="text-xs font-black uppercase tracking-wider" style={{ color: groupColors.fg }}>{groupName}</span>
                    </div>
                    <div className="p-4 flex flex-wrap gap-2 bg-white/50">
                      {items.map(item => {
                        const profile = profiles.find(p => p.id === item.id);
                        if (!profile) return null;
                        const Icon = getIconHelper(profile.icon_slug, profile.group_name);
                        const colors = getAromaColors(profile.hex_color);
                        return (
                          <div key={item.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border shadow-sm animate-in fade-in zoom-in duration-300"
                            style={{ backgroundColor: colors.bg, borderColor: colors.border }}>
                            <Icon size={12} color={colors.fg} />
                            <span className="text-[10px] font-black uppercase tracking-wide" style={{ color: colors.fg }}>{profile.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-stone-400 italic">Devi ancora votare le note aromatiche di questa tavoletta.</p>
          )}
        </section>
      )}

      {/* Community Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-secondary" />
            <h4 className="text-sm font-bold text-primary uppercase tracking-widest">Verdetto della Community</h4>
          </div>
          <button onClick={fetchData} className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-primary" aria-label="Aggiorna dati">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {communityFamilies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {communityFamilies.map(({ groupName, hex_color, icon_slug, items }) => {
              const groupColors = getAromaColors(hex_color);
              const GroupIcon = getIconHelper(icon_slug, groupName);
              return (
                <div key={groupName} className="rounded-2xl border overflow-hidden shadow-sm" style={{ borderColor: groupColors.border }}>
                  <div className="flex items-center gap-2.5 px-5 py-3.5" style={{ backgroundColor: groupColors.bg }}>
                    <GroupIcon size={15} strokeWidth={2.5} color={groupColors.fg} />
                    <span className="text-xs font-black uppercase tracking-wider" style={{ color: groupColors.fg }}>{groupName}</span>
                  </div>
                  <div className="p-4 space-y-3 bg-white/50">
                    {(items as CommunityStat[]).map(stat => {
                      const profile = profiles.find(p => p.id === stat.aroma_id);
                      if (!profile) return null;
                      const Icon = getIconHelper(profile.icon_slug, profile.group_name);
                      const colors = getAromaColors(profile.hex_color);
                      return (
                        <div key={stat.aroma_id} className="space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <div className="flex items-center gap-2">
                              <Icon size={12} color={colors.fg} />
                              <span className="font-black uppercase tracking-wide" style={{ color: colors.fg }}>{profile.name}</span>
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
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
            <Fingerprint size={48} className="text-stone-100 mx-auto mb-4" />
            <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">Ancora nessun dato comunitario per questa tavoletta.</p>
          </div>
        )}
      </section>
    </div>
  );
};
