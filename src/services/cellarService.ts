import { supabase } from '../lib/supabase';

export interface CellarNote {
  bar_id: number;
  note: string;
  updated_at: string;
}

export const cellarService = {
  async fetchUserNotes(userId: string): Promise<CellarNote[]> {
    const { data, error } = await supabase
      .from('user_bar_notes')
      .select('bar_id, note, updated_at')
      .eq('user_id', userId);
    if (error) throw error;
    return data || [];
  },

  async saveNote(userId: string, barId: number, note: string): Promise<void> {
    const { error } = await supabase
      .from('user_bar_notes')
      .upsert(
        { user_id: userId, bar_id: barId, note, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,bar_id' }
      );
    if (error) throw error;
  },
};
