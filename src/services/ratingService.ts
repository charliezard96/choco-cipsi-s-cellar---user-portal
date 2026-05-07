
import { supabase } from '../lib/supabase';

export const ratingService = {
  async fetchRatings(chocolateId: string) {
    const { data, error } = await supabase
      .from('user_ratings')
      .select('rating')
      .eq('chocolate_id', chocolateId);
      
    if (error) throw error;
    
    const ratings = data?.map(r => r.rating) || [];
    const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
    const totalRatings = ratings.length;

    return { avgRating, totalRatings };
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
    const { data: existing, error: checkError } = await supabase
      .from('user_ratings')
      .select('id')
      .eq('user_id', userId)
      .eq('chocolate_id', chocolateId)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existing) {
      const { error } = await supabase
        .from('user_ratings')
        .update({ rating: rating })
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('user_ratings')
        .insert({
          user_id: userId,
          chocolate_id: chocolateId,
          rating: rating
        });
      if (error) throw error;
    }
  }
};
