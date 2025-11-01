import { useTranslation } from '@/shared/hooks';
import { Shield, Lock, Eye, UserCheck, Cookie, Share2 } from 'lucide-react';

export const PrivacyPage = () => {
  const { t } = useTranslation();

  const sections = [
    {
      key: 'dataCollection',
      icon: Eye,
    },
    {
      key: 'dataUsage',
      icon: UserCheck,
    },
    {
      key: 'dataSecurity',
      icon: Lock,
    },
    {
      key: 'dataSharing',
      icon: Share2,
    },
    {
      key: 'userRights',
      icon: Shield,
    },
    {
      key: 'cookies',
      icon: Cookie,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <Shield className="w-12 h-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('privacy.title')}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('privacy.lastUpdated')}
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-white dark:bg-surface-card rounded-xl shadow-sm border border-gray-200 dark:border-border-light p-8 mb-8">
          <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
            {t('privacy.intro')}
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map(({ key, icon: Icon }) => (
            <div
              key={key}
              className="bg-white dark:bg-surface-card rounded-xl shadow-sm border border-gray-200 dark:border-border-light p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {t(`privacy.sections.${key}.title`)}
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {t(`privacy.sections.${key}.content`)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-8 border border-primary/20">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('footer.contact')}
          </h3>
          <p className="text-gray-700 dark:text-gray-300">
            {t('privacy.contact')}
          </p>
        </div>
      </div>
    </div>
  );
};
