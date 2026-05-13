import { supabase } from '../lib/supabase';
import { AromaProfile, BarLevelTag, NoteVote } from '../types';

let profilesCache: Promise<AromaProfile[]> | null = null;
const barTagsCache = new Map<string, Promise<BarLevelTag[]>>();

export const aromaService = {
  fetchProfiles(): Promise<AromaProfile[]> {
    if (!profilesCache) {
      profilesCache = Promise.resolve(supabase.from('aroma_profiles').select('*')).then(({ data, error }) => {
        if (error) { profilesCache = null; throw error; }
        return (data || []) as AromaProfile[];
      });
    }
    return profilesCache;
  },

  fetchBarLevelTags(chocolateId: string): Promise<BarLevelTag[]> {
    if (!barTagsCache.has(chocolateId)) {
      const p = Promise.resolve(supabase.from('bar_level_tags').select('bar_id, group_name, subgroup_name').eq('bar_id', chocolateId)).then(({ data, error }) => {
        if (error) { barTagsCache.delete(chocolateId); throw error; }
        return (data || []) as BarLevelTag[];
      });
      barTagsCache.set(chocolateId, p);
    }
    return barTagsCache.get(chocolateId)!;
  },

  async fetchOfficialNotes(chocolateId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('BAR_AROMA_RELATION')
      .select('aroma_id')
      .eq('bar_id', chocolateId);
    if (error) throw error;
    return data?.map(d => d.aroma_id) || [];
  },

  async fetchVotes(chocolateId: string, userId?: string): Promise<NoteVote[]> {
    const { data: votes, error } = await supabase
      .from('chocolate_aroma_votes')
      .select('aroma_id, user_id')
      .eq('chocolate_id', chocolateId);

    if (error) throw error;

    const aromaIds = Array.from(new Set(votes?.map(v => v.aroma_id) || []));
    return aromaIds.map(id => ({
      aroma_id: id,
      count: votes?.filter(v => v.aroma_id === id).length || 0,
      user_voted: !!userId && !!votes?.find(v => v.aroma_id === id && v.user_id === userId),
    }));
  },

  async toggleVote(
    chocolateId: string,
    aromaId: string,
    userId: string,
    hasVoted: boolean
  ): Promise<void> {
    if (hasVoted) {
      const { error } = await supabase
        .from('chocolate_aroma_votes')
        .delete()
        .eq('chocolate_id', chocolateId)
        .eq('aroma_id', aromaId)
        .eq('user_id', userId);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('chocolate_aroma_votes')
        .insert({ chocolate_id: chocolateId, aroma_id: aromaId, user_id: userId });
      if (error) throw error;
    }
    barTagsCache.delete(chocolateId);
  },

  async fetchAromaStats(chocolateId: string) {
    const { data, error } = await supabase
      .from('community_aroma_stats')
      .select('*')
      .eq('chocolate_id', chocolateId);
    if (error) throw error;
    return data || [];
  },

  async fetchUserVotes(userId: string, chocolateId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('chocolate_aroma_votes')
      .select('aroma_id')
      .eq('chocolate_id', chocolateId)
      .eq('user_id', userId);
    if (error) throw error;
    return data?.map(v => v.aroma_id) || [];
  },

  /**
   * Fetch community stats (voti aggregati per cioccolato).
   * Usato da ChocolateSensoryProfile — prima era una query diretta nel componente.
   */
  async fetchCommunityStats(chocolateId: string) {
    const { data, error } = await supabase
      .from('chocolate_aroma_votes')
      .select('aroma_id, user_id')
      .eq('chocolate_id', chocolateId);

    if (error) throw error;

    const totalVoters = new Set(data?.map(v => v.user_id) || []).size;
    const counts: Record<string, number> = {};

    (data || []).forEach(v => {
      counts[v.aroma_id] = (counts[v.aroma_id] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([id, count]) => ({
        aroma_id: id,
        count,
        percentage: totalVoters > 0 ? (count / totalVoters) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);
  },
};