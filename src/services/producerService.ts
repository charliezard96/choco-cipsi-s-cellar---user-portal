import { supabase } from '../lib/supabase';
import { Producer } from '../types';

export const producerService = {
  async fetchAll(): Promise<Producer[]> {
    const { data, error } = await supabase
      .from('CHOCO_MAKERS')
      .select('*');

    if (error) throw error;

    return (data || []).map((m: any) => ({
      id: m.id ? String(m.id) : (m.name || m.brand || crypto.randomUUID()),
      name: (m.name || m.brand || 'Produttore Ignoto').trim(),
      location: m.location || m.origin || 'Sconosciuta',
      description: m.description || 'Pioniere del cioccolato bean-to-bar.',
      imageUrl: m.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop',
      tags: Array.isArray(m.tags) ? m.tags : ['Artigianale', 'Commercio Diretto'],
      verified: !!m.verified,
      philosophy: m.philosophy || '',
      specialFeature: m.special_feature || '',
      founders: m.founders || '',
      logoUrl: (m.logo_url || m.logo || m.brand_logo || m.icon || '').trim(),
      websiteUrl: m.website_url || '',
    }));
  },
};