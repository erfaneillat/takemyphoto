import { useTranslation } from '@/shared/hooks';
import { FileText, CheckCircle, User, Shield, AlertTriangle, Scale, XCircle } from 'lucide-react';

export const TermsPage = () => {
  const { t } = useTranslation();

  const sections = [
    {
      key: 'acceptance',
      icon: CheckCircle,
    },
    {
      key: 'userAccounts',
      icon: User,
    },
    {
      key: 'serviceUsage',
      icon: Shield,
    },
    {
      key: 'intellectualProperty',
      icon: FileText,
    },
    {
      key: 'prohibited',
      icon: AlertTriangle,
    },
    {
      key: 'limitation',
      icon: Scale,
    },
    {
      key: 'termination',
      icon: XCircle,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <FileText className="w-12 h-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('terms.title')}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('terms.lastUpdated')}
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-white dark:bg-surface-card rounded-xl shadow-sm border border-gray-200 dark:border-border-light p-8 mb-8">
          <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
            {t('terms.intro')}
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
                    {t(`terms.sections.${key}.title`)}
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {t(`terms.sections.${key}.content`)}
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
            {t('terms.contact')}
          </p>
        </div>
      </div>
    </div>
  );
};
