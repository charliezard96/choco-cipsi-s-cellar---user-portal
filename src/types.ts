
export interface AromaProfile {
  id: string;
  name: string;
  group_name: string;
  subgroup_name: string | null;
  hex_color: string | null;
  icon_slug: string | null;
  description: string | null;
}

export interface Chocolate {
  id: string;
  name: string;
  percentage: string;
  origin: string;
  tastingNotes: string[];
  imageUrl: string;
  imageBars?: string;
  description: string;
  producer: string;
  producerId?: string;
  region?: string;
  harvestYear: string;
  logoUrl?: string;
}

export interface Producer {
  id: string;
  name: string;
  location: string;
  description: string;
  tags: string[];
  imageUrl: string;
  verified?: boolean;
  philosophy?: string;
  specialFeature?: string;
  founders?: string;
  logoUrl?: string;
}

export interface TastingEvent {
  id: string;
  created_at: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string;
  venue_name: string | null;
  price: number | null;
  max_capacity: number | null;
  image_url: string | null;
  is_published: boolean;
}

export interface NoteVote {
  aroma_id: string;
  count: number;
  user_voted: boolean;
}

export interface UserRating {
  rating: number;
  avgRating: number | null;
  totalRatings: number;
}
