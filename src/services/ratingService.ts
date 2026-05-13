import { supabase } from '../lib/supabase';

const ratingsCache = new Map<string, Promise<{ avgRating: number | null; totalRatings: number }>>();

export const ratingService = {
  fetchRatings(chocolateId: string) {
    if (!ratingsCache.has(chocolateId)) {
      const p = Promise.resolve(supabase.from('user_ratings').select('rating').eq('chocolate_id', chocolateId)).then(({ data, error }) => {
        if (error) { ratingsCache.delete(chocolateId); throw error; }
        const ratings = data?.map(r => r.rating) || [];
        return {
          avgRating: ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : null,
          totalRatings: ratings.length,
        };
      });
      ratingsCache.set(chocolateId, p);
    }
    return ratingsCache.get(chocolateId)!;
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
    ratingsCache.delete(chocolateId);
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