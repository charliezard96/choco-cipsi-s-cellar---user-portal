
import { useState, useEffect, useCallback } from 'react';
import { AromaProfile, NoteVote } from '../types';
import { aromaService } from '../services/aromaService';
import { ratingService } from '../services/ratingService';

export const useChocolateDetail = (chocolateId: string, userId?: string) => {
  const [aromaProfiles, setAromaProfiles] = useState<AromaProfile[]>([]);
  const [officialNotes, setOfficialNotes] = useState<AromaProfile[]>([]);
  const [noteVotes, setNoteVotes] = useState<NoteVote[]>([]);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [totalRatings, setTotalRatings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch common data
      const [profiles, votes, ratings] = await Promise.all([
        aromaService.fetchProfiles(),
        aromaService.fetchVotes(chocolateId, userId),
        ratingService.fetchRatings(chocolateId)
      ]);

      setAromaProfiles(profiles);
      setNoteVotes(votes);
      setAvgRating(ratings.avgRating);
      setTotalRatings(ratings.totalRatings);

      // Fetch official notes IDs and filter
      const officialIds = await aromaService.fetchOfficialNotes(chocolateId);
      setOfficialNotes(profiles.filter(p => officialIds.includes(p.id)));

      // Fetch user rating if logged in
      if (userId) {
        const uRating = await ratingService.fetchUserRating(chocolateId, userId);
        setUserRating(uRating);
      } else {
        setUserRating(null);
      }
    } catch (err) {
      console.error('Error fetching chocolate detail data:', err);
    } finally {
      setLoading(false);
    }
  }, [chocolateId, userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]);

  const handleRate = async (rating: number) => {
    if (!userId) return;
    await ratingService.saveRating(chocolateId, userId, rating);
    setUserRating(rating);
    const ratings = await ratingService.fetchRatings(chocolateId);
    setAvgRating(ratings.avgRating);
    setTotalRatings(ratings.totalRatings);
  };

  const handleToggleVote = async (aromaId: string) => {
    if (!userId) return;
    const existingVote = noteVotes.find(nv => nv.aroma_id === aromaId && nv.user_voted);
    await aromaService.toggleVote(chocolateId, aromaId, userId, !!existingVote);
    setRefreshTrigger(prev => prev + 1);
  };

  return {
    aromaProfiles,
    officialNotes,
    noteVotes,
    userRating,
    avgRating,
    totalRatings,
    loading,
    refreshTrigger,
    handleRate,
    handleToggleVote
  };
};
