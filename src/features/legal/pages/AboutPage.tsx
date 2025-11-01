import { useTranslation } from '@/shared/hooks';
import { Zap, Users, Target, Heart, Sparkles } from 'lucide-react';

export const AboutPage = () => {
  const { t } = useTranslation();

  // Define values array directly since translations don't support nested arrays
  const values = [
    {
      title: t('about.values.items.0.title'),
      description: t('about.values.items.0.description'),
    },
    {
      title: t('about.values.items.1.title'),
      description: t('about.values.items.1.description'),
    },
    {
      title: t('about.values.items.2.title'),
      description: t('about.values.items.2.description'),
    },
    {
      title: t('about.values.items.3.title'),
      description: t('about.values.items.3.description'),
    },
  ];

  const features = [
    {
      title: t('about.features.items.0.title'),
      description: t('about.features.items.0.description'),
    },
    {
      title: t('about.features.items.1.title'),
      description: t('about.features.items.1.description'),
    },
    {
      title: t('about.features.items.2.title'),
      description: t('about.features.items.2.description'),
    },
    {
      title: t('about.features.items.3.title'),
      description: t('about.features.items.3.description'),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-6">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t('about.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            {t('about.subtitle')}
          </p>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Mission */}
          <div className="bg-white dark:bg-surface-card rounded-xl shadow-sm border border-gray-200 dark:border-border-light p-8 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('about.mission.title')}
              </h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {t('about.mission.description')}
            </p>
          </div>

          {/* Vision */}
          <div className="bg-white dark:bg-surface-card rounded-xl shadow-sm border border-gray-200 dark:border-border-light p-8 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-secondary/10 rounded-lg">
                <Zap className="w-6 h-6 text-secondary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('about.vision.title')}
              </h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {t('about.vision.description')}
            </p>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-gray-100 dark:bg-surface py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('about.values.title')}
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white dark:bg-surface-card rounded-lg shadow-sm border border-gray-200 dark:border-border-light p-6 text-center hover:shadow-md transition-shadow"
              >
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {t('about.features.title')}
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white dark:bg-surface-card rounded-xl shadow-sm border border-gray-200 dark:border-border-light p-8 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white dark:bg-surface-card rounded-full shadow-sm">
              <Users className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {t('about.team.title')}
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            {t('about.team.description')}
          </p>
        </div>
      </div>
    </div>
  );
};
