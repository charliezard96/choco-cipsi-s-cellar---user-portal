
import { supabase } from '../lib/supabase';
import { Chocolate } from '../types';

export const chocolateService = {
  async fetchAll(): Promise<Chocolate[]> {
    if (!supabase) throw new Error('Supabase client not initialized');

    const { data, error } = await supabase
      .from('CHOCO_BARS')
      .select(`
        *,
        BAR_AROMA_RELATION (
          aroma_profiles (
            name
          )
        )
      `);

    if (error) throw error;

    return (data || []).map((item: any) => {
      const relationNotes = item.BAR_AROMA_RELATION?.map((rel: any) => rel.aroma_profiles?.name).filter(Boolean) || [];
      
      return {
        id: String(item.id),
        name: item.name || 'Senza Nome',
        percentage: item.percentage ? `${item.percentage}%` : '0%',
        origin: item.origin || 'Origine Sconosciuta',
        tastingNotes: relationNotes.length > 0 ? relationNotes : (Array.isArray(item.notes) ? item.notes : []),
        imageUrl: item.image_url || 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=800&auto=format&fit=crop',
        imageBars: item.image_bars || 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?q=80&w=800&auto=format&fit=crop',
        description: item.description || 'Nessuna descrizione disponibile.',
        producer: (item.brand || 'Produttore Ignoto').trim(),
        producerId: item.brand_id ? String(item.brand_id) : undefined,
        region: item.region || '',
        harvestYear: (String(item.harvest_year) || '2024').trim(),
        logoUrl: (item.logo_url || item.logo || item.brand_logo || item.icon || '').trim()
      };
    });
  }
};
