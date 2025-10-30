interface StyleCardSkeletonProps {
  index?: number;
}

export const StyleCardSkeleton = ({ index = 0 }: StyleCardSkeletonProps) => {
  // Match the varying aspect ratios from StyleCard
  const getAspectRatio = () => {
    const patterns = ['aspect-[3/4]', 'aspect-square', 'aspect-[4/5]', 'aspect-[2/3]', 'aspect-[3/5]'];
    return patterns[index % patterns.length];
  };

  return (
    <div className="group relative flex flex-col rounded-xl overflow-hidden bg-gray-100 dark:bg-surface border border-gray-200 dark:border-border-light mb-4 break-inside-avoid">
      <div className={`w-full ${getAspectRatio()} bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-surface-hover dark:via-gray-700 dark:to-surface-hover animate-shimmer bg-[length:200%_100%]`}></div>
    </div>
  );
};
