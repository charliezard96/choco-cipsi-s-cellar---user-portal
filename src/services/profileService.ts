import { supabase } from '../lib/supabase';
import { CommunityProfile } from '../types';

/**
 * Service per le operazioni sui profili utente.
 * Centralizza le query che prima erano sparse in ProfileView e CommunityView.
 */
export const profileService = {
  /** Cerca profili per username, nome o cognome */
  async search(term: string, limit = 10): Promise<CommunityProfile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`username.ilike.%${term}%,name.ilike.%${term}%,surname.ilike.%${term}%`)
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  /** Aggiorna i campi del profilo */
  async update(
    userId: string,
    fields: {
      username?: string;
      name?: string;
      surname?: string;
      about_me?: string;
      favourite_origin?: string;
    }
  ): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update(fields)
      .eq('id', userId);
    if (error) throw error;
  },

  /** Upload avatar e aggiornamento profilo */
  async uploadAvatar(userId: string, file: File): Promise<string> {
    const ext = file.name.split('.').pop();
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file);
    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(path);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', userId);
    if (updateError) throw updateError;

    return publicUrl;
  },

  /** Voti aromatici di un utente (per la sezione "Le Mie Note") */
  async fetchUserAromaVotes(userId: string) {
    const { data, error } = await supabase
      .from('chocolate_aroma_votes')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return data || [];
  },

  /** Utenti più attivi: profili con più valutazioni */
  async fetchActive(limit = 6): Promise<(CommunityProfile & { ratingCount: number })[]> {
    const { data: ratings, error: rErr } = await supabase
      .from('user_ratings')
      .select('user_id');
    if (rErr) throw rErr;

    const counts: Record<string, number> = {};
    (ratings || []).forEach(r => { counts[r.user_id] = (counts[r.user_id] || 0) + 1; });
    const topIds = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([id]) => id);
    if (topIds.length === 0) return [];

    const { data: profiles, error: pErr } = await supabase
      .from('profiles')
      .select('*')
      .in('id', topIds);
    if (pErr) throw pErr;

    return (profiles || []).map(p => ({ ...p, ratingCount: counts[p.id] || 0 }))
      .sort((a, b) => b.ratingCount - a.ratingCount);
  },
};