export const StyleCardSkeleton = () => {
  return (
    <div className="group relative flex flex-col rounded-xl overflow-hidden bg-gray-100 dark:bg-surface border border-gray-200 dark:border-border-light animate-pulse mb-4 break-inside-avoid">
      <div className="w-full aspect-[3/4] bg-gray-200 dark:bg-surface-hover"></div>
    </div>
  );
};
