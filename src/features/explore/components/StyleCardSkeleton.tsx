export const StyleCardSkeleton = () => {
  return (
    <div className="group relative flex flex-col rounded-xl overflow-hidden bg-gray-100 dark:bg-surface border border-gray-200 dark:border-border-light animate-pulse">
      <div className="w-full h-56 bg-gray-200 dark:bg-surface-hover"></div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="h-6 w-3/4 bg-gray-200 dark:bg-surface-hover rounded"></div>
        <div className="h-4 w-full mt-2 bg-gray-200 dark:bg-surface-hover rounded"></div>
        <div className="h-4 w-2/3 mt-1 bg-gray-200 dark:bg-surface-hover rounded"></div>
        <div className="mt-3 flex gap-4">
          <div className="h-3 w-16 bg-gray-200 dark:bg-surface-hover rounded"></div>
          <div className="h-3 w-16 bg-gray-200 dark:bg-surface-hover rounded"></div>
        </div>
        <div className="mt-5 flex justify-between items-center gap-3">
          <div className="h-10 w-24 bg-gray-200 dark:bg-surface-hover rounded-lg flex-1"></div>
          <div className="h-4 w-6 bg-gray-200 dark:bg-surface-hover rounded"></div>
        </div>
      </div>
    </div>
  );
};
