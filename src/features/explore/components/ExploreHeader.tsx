import { useTranslation } from '@/shared/hooks';

export const ExploreHeader = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap justify-center text-center gap-4 p-4">
      <div className="flex flex-col gap-4">
        <h1 className="text-gray-900 dark:text-white text-4xl md:text-5xl font-black leading-tight tracking-tight">
          {t('explore.heroTitle') || 'Discover Your Next Masterpiece'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg font-normal leading-normal">
          {t('explore.heroSubtitle') || 'Explore the Frontiers of AI Art'}
        </p>
      </div>
    </div>
  );
};
