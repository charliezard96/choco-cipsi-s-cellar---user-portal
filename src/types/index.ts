/* ── Domain Models ── */

export interface Chocolate {
  id: string;
  slug: string;
  name: string;
  percentage: string;
  origin: string;
  region: string;
  tastingNotes: string[];
  imageUrl: string;
  imageBars: string;
  description: string;
  producer: string;
  producerId?: string;
  harvestYear: string;
  logoUrl: string;
}

export interface Producer {
  id: string;
  name: string;
  location: string;
  description: string;
  imageUrl: string;
  tags: string[];
  verified: boolean;
  philosophy: string;
  specialFeature: string;
  founders: string;
  logoUrl: string;
  websiteUrl: string;
}

export interface AromaProfile {
  id: string;
  name: string;
  group_name: string;
  subgroup_name?: string;
  icon_slug: string | null;
  hex_color: string | null;
}

export interface NoteVote {
  aroma_id: string;
  count: number;
  user_voted: boolean;
}

export interface BarLevelTag {
  bar_id: number;
  group_name: string;
  subgroup_name: string;
}

export interface TastingEvent {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  location: string;
  venue_name?: string;
  image_url?: string;
  price?: number;
  max_capacity?: number;
  is_published: boolean;
  // Legacy fields (for EventCard compatibility)
  series?: string;
  date?: string;
  status?: string;
  imageUrl?: string;
}

export interface CommunityProfile {
  id: string;
  username: string;
  name: string;
  surname: string;
  avatar_url: string;
  about_me: string;
  favourite_origin: string;
}

export interface TopRatedChocolate extends Chocolate {
  averageRating: number;
  ratingCount: number;
}