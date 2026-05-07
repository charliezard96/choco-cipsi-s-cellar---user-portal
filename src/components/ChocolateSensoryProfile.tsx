import React, { useState, useEffect, useMemo } from 'react';
import * as Icons from 'lucide-react';
import { Fingerprint, Users, RefreshCw, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AromaProfile } from '../types';
import { aromaService } from '../services/aromaService';
import { getIconHelper } from '../utils/iconUtils';

interface ChocolateSensoryProfileProps {
  chocolateId: string;
  userId?: string;
  profiles: AromaProfile[];
  refreshTrigger?: number; // Used to trigger re-fetch when votes change
}

interface CommunityStat {
  aroma_id: string;
  count: number;
  percentage: number;
}

export const ChocolateSensoryProfile: React.FC<ChocolateSensoryProfileProps> = ({ 
  chocolateId, 
  userId, 
  profiles,
  refreshTrigger 
}) => {
  const [loading, setLoading] = useState(true);
  const [userVotes, setUserVotes] = useState<string[]>([]);
  const [communityStats, setCommunityStats] = useState<CommunityStat[]>([]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      // Fetch user votes
      if (userId) {
        const uVotes = await aromaService.fetchUserVotes(userId, chocolateId);
        setUserVotes(uVotes);
      }

      // Fetch community stats
      // Since we might not have a complex view set up for RPC, we'll aggregate manually for accuracy
      const { data: allVotes } = await supabase
        .from('chocolate_aroma_votes')
        .select('aroma_id, user_id')
        .eq('chocolate_id', chocolateId);

      if (allVotes) {
        const totalVoters = new Set(allVotes.map(v => v.user_id)).size;
        const counts: Record<string, number> = {};
        
        allVotes.forEach(v => {
          counts[v.aroma_id] = (counts[v.aroma_id] || 0) + 1;
        });

        const stats: CommunityStat[] = Object.keys(counts).map(id => ({
          aroma_id: id,
          count: counts[id],
          percentage: totalVoters > 0 ? (counts[id] / totalVoters) * 100 : 0
        })).sort((a, b) => b.count - a.count);

        setCommunityStats(stats);
      }
    } catch (e) {
      console.error('fetchProfileData error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [chocolateId, userId, refreshTrigger]);



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
                const IconComp = getIconHelper(profile.icon_slug, profile.group_name);
                return (
                  <div 
                    key={id}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm animate-in fade-in zoom-in duration-300"
                    style={{ 
                      backgroundColor: profile.hex_color ? `${profile.hex_color}15` : '#f3f4f6',
                      borderColor: profile.hex_color ? `${profile.hex_color}50` : '#e5e7eb',
                    }}
                  >
                    <IconComp size={14} color={profile.hex_color || undefined} />
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
          <button 
            onClick={fetchProfileData}
            className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-primary"
            title="Aggiorna dati"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="space-y-8">
          {topAromas.length > 0 ? (
            <div className="space-y-12">
              {/* Top 5 Highlighted */}
              <div className="space-y-6">
                <p className="text-[10px] font-black text-secondary/40 uppercase tracking-[0.2em] mb-4">I Fantastici Cinque</p>
                {topAromas.slice(0, 5).map((stat, index) => {
                  const profile = profiles.find(p => p.id === stat.aroma_id);
                  if (!profile) return null;
                  const IconComp = getIconHelper(profile.icon_slug, profile.group_name);
                  
                  return (
                    <div key={stat.aroma_id} className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[10px] text-stone-300">0{index + 1}</span>
                          <div className="flex items-center gap-2">
                             <IconComp size={16} color={profile.hex_color || undefined} />
                             <span className="font-black text-primary uppercase tracking-wider">{profile.name}</span>
                          </div>
                        </div>
                        <span className="font-bold text-secondary">{Math.round(stat.percentage)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{ 
                            width: `${stat.percentage}%`,
                            backgroundColor: profile.hex_color || 'var(--color-primary)' 
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Others in 2-column grid */}
              {topAromas.length > 5 && (
                <div className="space-y-6">
                  <p className="text-[10px] font-black text-stone-300 uppercase tracking-[0.2em] mb-4">Altre Sfumature Emerse</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    {topAromas.slice(5).map((stat) => {
                      const profile = profiles.find(p => p.id === stat.aroma_id);
                      if (!profile) return null;
                      const IconComp = getIconHelper(profile.icon_slug, profile.group_name);
                      
                      return (
                        <div key={stat.aroma_id} className="space-y-2">
                          <div className="flex items-center justify-between text-[10px]">
                            <div className="flex items-center gap-2">
                               <IconComp size={14} color={profile.hex_color || undefined} />
                               <span className="font-bold text-primary uppercase tracking-wider">{profile.name}</span>
                            </div>
                            <span className="font-bold text-stone-400">{Math.round(stat.percentage)}%</span>
                          </div>
                          <div className="h-1 w-full bg-stone-50 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-1000 ease-out opacity-60"
                              style={{ 
                                width: `${stat.percentage}%`,
                                backgroundColor: profile.hex_color || 'var(--color-primary)' 
                              }}
                            />
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
        </div>
      </section>
    </div>
  );
};
