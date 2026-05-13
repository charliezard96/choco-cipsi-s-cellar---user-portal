import { aromaService } from '../services/aromaService';
import { ratingService } from '../services/ratingService';

const prefetched = new Set<string>();

export function prefetchChocolateDetail(chocolateId: string) {
  if (prefetched.has(chocolateId)) return;
  prefetched.add(chocolateId);
  aromaService.fetchBarLevelTags(chocolateId).catch(() => {});
  ratingService.fetchRatings(chocolateId).catch(() => {});
}
