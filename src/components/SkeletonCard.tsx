import React from 'react';

export const SkeletonCard: React.FC = () => (
  <div className="bg-white border border-primary/15 animate-pulse">
    <div className="aspect-[4/5] bg-stone-100" />
    <div className="p-3 space-y-2">
      <div className="h-2 bg-stone-100 rounded w-1/2" />
      <div className="h-4 bg-stone-100 rounded w-3/4" />
      <div className="h-2 bg-stone-100 rounded w-1/3 mt-1" />
      <div className="flex gap-1 mt-2">
        <div className="h-4 w-12 bg-stone-100 rounded" />
        <div className="h-4 w-16 bg-stone-100 rounded" />
        <div className="h-4 w-10 bg-stone-100 rounded" />
      </div>
    </div>
  </div>
);
