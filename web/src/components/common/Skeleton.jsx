import React from 'react';

export const PropertyCardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl overflow-hidden shadow-sm animate-pulse">
      <div className="h-56 bg-slate-200 dark:bg-slate-800 w-full" />
      <div className="p-5 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
          <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
        </div>
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
        <div className="flex gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/5" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/5" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/5" />
        </div>
      </div>
    </div>
  );
};

export const PropertyDetailSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-8 animate-pulse">
      <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl w-full" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
          <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
          <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded w-full mt-4" />
        </div>
        <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />
      </div>
    </div>
  );
};
