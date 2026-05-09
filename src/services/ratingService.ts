import { supabase } from '../lib/supabase';

export const ratingService = {
  async fetchRatings(chocolateId: string) {
    const { data, error } = await supabase
      .from('user_ratings')
      .select('rating')
      .eq('chocolate_id', chocolateId);

    if (error) throw error;

    const ratings = data?.map(r => r.rating) || [];
    return {
      avgRating: ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null,
      totalRatings: ratings.length,
    };
  },

  async fetchUserRating(chocolateId: string, userId: string): Promise<number | null> {
    const { data, error } = await supabase
      .from('user_ratings')
      .select('rating')
      .eq('chocolate_id', chocolateId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data?.rating || null;
  },

  async saveRating(chocolateId: string, userId: string, rating: number): Promise<void> {
    const { error } = await supabase
      .from('user_ratings')
      .upsert(
        { user_id: userId, chocolate_id: chocolateId, rating },
        { onConflict: 'user_id,chocolate_id' }
      );
    if (error) throw error;
  },

  /** Tutte le valutazioni di un utente */
  async fetchUserRatings(userId: string) {
    const { data, error } = await supabase
      .from('user_ratings')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  },

  /** Tutte le valutazioni aggregate (per community top-rated) */
  async fetchAllRatings() {
    const { data, error } = await supabase
      .from('user_ratings')
      .select('chocolate_id, rating');

    if (error) throw error;
    return data || [];
  },
};