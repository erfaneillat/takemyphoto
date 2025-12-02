import { Link } from 'react-router-dom';
import { useTranslation } from '@/shared/hooks';
import { Logo } from './Logo';
import { Github, Twitter, Instagram, Info, FileText, Shield, Mail } from 'lucide-react';

export const Footer = () => {
  const { t, language } = useTranslation();
  const isIran = language === 'fa';

  const footerLinks = [
    { path: '/about', label: t('footer.about'), icon: Info },
    { path: '/terms', label: t('footer.terms'), icon: FileText },
    { path: '/privacy', label: t('footer.privacy'), icon: Shield },
    { path: '/contact', label: t('footer.contact'), icon: Mail },
  ];

  return (
    <footer className="bg-gray-50 dark:bg-surface-card border-t border-gray-200 dark:border-border-light mt-auto transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Logo and Branding */}
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200 dark:border-border-light">
          <Logo size="md" />
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('app.title')}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('app.description')}</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Links */}
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            {footerLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-200 hover:scale-105"
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </div>

          {/* Social Icons */}
          <div className="flex gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:text-white hover:bg-gray-800 dark:hover:bg-white/20 transition-all duration-300 hover:scale-110"
              aria-label="Github"
            >
              <Github size={20} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:text-white hover:bg-blue-500 transition-all duration-300 hover:scale-110"
              aria-label="Twitter"
            >
              <Twitter size={20} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:text-white hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500 transition-all duration-300 hover:scale-110"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
          </div>

          {/* Enamad Trust Seal - Iran Region Only */}
          {isIran && (
            <a
              referrerPolicy="origin"
              target="_blank"
              rel="noopener noreferrer"
              href="https://trustseal.enamad.ir/?id=680757&Code=QQRtu3KcbDj47gicg6yYWX3W3XXEvtpU"
            >
              <img
                src="/enamad.png"
                alt="Enamad Trust Seal"
                className="h-16 cursor-pointer"
              />
            </a>
          )}
        </div>

        {/* Copyright */}
        <div className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
          {t('footer.copyright')}
        </div>
      </div>
    </footer>
  );
};
