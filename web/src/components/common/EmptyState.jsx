import React from 'react';
import { SearchEmptyIllustration } from '../illustrations/SearchEmptyIllustration';
import { Button } from './Button';

export const EmptyState = ({
  title = "No properties found",
  description = "We couldn't find any rental properties matching your current criteria. Try adjusting your search filters.",
  actionText,
  onAction,
  illustration: CustomIllustration
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 py-12 rounded-3xl bg-white/50 dark:bg-dark-card/50 border border-slate-200/60 dark:border-dark-border/60 max-w-md mx-auto my-8">
      {CustomIllustration ? <CustomIllustration /> : <SearchEmptyIllustration />}
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-6 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
