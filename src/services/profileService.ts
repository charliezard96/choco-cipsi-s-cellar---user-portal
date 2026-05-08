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
};