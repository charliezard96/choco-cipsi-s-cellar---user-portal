import { useState, useEffect, useCallback } from 'react';
import { AromaProfile, BarLevelTag, NoteVote } from '../types';
import { aromaService } from '../services/aromaService';
import { ratingService } from '../services/ratingService';

export const useChocolateDetail = (chocolateId: string, userId?: string) => {
  const [aromaProfiles, setAromaProfiles] = useState<AromaProfile[]>([]);
  const [officialNotes, setOfficialNotes] = useState<AromaProfile[]>([]);
  const [barLevelTags, setBarLevelTags] = useState<BarLevelTag[]>([]);
  const [noteVotes, setNoteVotes] = useState<NoteVote[]>([]);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [totalRatings, setTotalRatings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [profiles, votes, ratings, tags] = await Promise.all([
        aromaService.fetchProfiles(),
        aromaService.fetchVotes(chocolateId, userId),
        ratingService.fetchRatings(chocolateId),
        aromaService.fetchBarLevelTags(chocolateId),
      ]);

      setAromaProfiles(profiles);
      setNoteVotes(votes);
      setAvgRating(ratings.avgRating);
      setTotalRatings(ratings.totalRatings);
      setBarLevelTags(tags);

      const officialIds = await aromaService.fetchOfficialNotes(chocolateId);
      setOfficialNotes(profiles.filter(p => officialIds.includes(p.id)));

      if (userId) {
        setUserRating(await ratingService.fetchUserRating(chocolateId, userId));
      } else {
        setUserRating(null);
      }
    } catch (err) {
      console.error('[useChocolateDetail] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [chocolateId, userId]);

  useEffect(() => { fetchData(); }, [fetchData, refreshTrigger]);

  const handleRate = useCallback(async (rating: number) => {
    if (!userId) return;
    await ratingService.saveRating(chocolateId, userId, rating);
    setUserRating(rating);
    const updated = await ratingService.fetchRatings(chocolateId);
    setAvgRating(updated.avgRating);
    setTotalRatings(updated.totalRatings);
  }, [chocolateId, userId]);

  const handleToggleVote = useCallback(async (aromaId: string) => {
    if (!userId) return;
    const existing = noteVotes.find(nv => nv.aroma_id === aromaId && nv.user_voted);
    await aromaService.toggleVote(chocolateId, aromaId, userId, !!existing);
    setRefreshTrigger(prev => prev + 1);
  }, [chocolateId, userId, noteVotes]);

  return {
    aromaProfiles, officialNotes, barLevelTags, noteVotes,
    userRating, avgRating, totalRatings,
    loading, refreshTrigger,
    handleRate, handleToggleVote,
  };
};