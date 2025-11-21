import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '@/shared/hooks';
import { Compass, User, Wrench } from 'lucide-react';

export const BottomNavigation = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  const isToolsActive = isActive('/tools');

  const sideNavItems = [
    { path: '/explore', label: t('bottomNav.explore'), icon: Compass },
    { path: '/profile', label: t('bottomNav.profile'), icon: User },
  ];

  const LeftIcon = sideNavItems[0].icon;
  const RightIcon = sideNavItems[1].icon;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-black backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 shadow-2xl transition-colors">
      <div className="relative flex justify-around items-center px-2 py-2 safe-area-inset-bottom">
        {/* Left Nav Item */}
        <Link
          to={sideNavItems[0].path}
          className={`
            flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl
            transition-all duration-200 min-w-[64px] flex-1
            ${isActive(sideNavItems[0].path)
              ? 'text-gray-900 dark:text-white scale-100'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white active:scale-95'
            }
          `}
        >
          <div className="relative">
            <LeftIcon
              size={24}
              strokeWidth={isActive(sideNavItems[0].path) ? 2.5 : 2}
              className={`transition-all duration-200 ${isActive(sideNavItems[0].path) ? 'scale-110' : ''}`}
            />
            {isActive(sideNavItems[0].path) && (
              <div className="absolute inset-0 bg-gray-900/30 dark:bg-white/30 blur-lg animate-pulse" />
            )}
          </div>
          <span className={`text-xs font-medium transition-all duration-200 ${isActive(sideNavItems[0].path) ? 'scale-100' : 'scale-90'}`}>
            {sideNavItems[0].label}
          </span>
        </Link>

        {/* Center Tools Button - Special Design */}
        <Link
          to="/tools"
          className="relative flex items-center justify-center -mt-6 mx-2"
        >
          <div className={`
            w-16 h-16 rounded-2xl shadow-2xl transform transition-all duration-300
            flex items-center justify-center
            ${isToolsActive
              ? 'bg-gradient-to-br from-blue-500 to-cyan-500 scale-100 rotate-0'
              : 'bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 scale-95 hover:scale-100 active:scale-90'
            }
          `}>
            <Wrench
              size={20}
              className="text-white"
              strokeWidth={2.5}
            />
            {isToolsActive && (
              <div className="absolute inset-0 bg-blue-500/50 rounded-2xl blur-xl animate-pulse" />
            )}
          </div>
          <span className={`
            absolute -bottom-5 text-xs font-semibold whitespace-nowrap transition-all duration-200
            ${isToolsActive
              ? 'text-blue-600 dark:text-cyan-400 scale-100'
              : 'text-gray-600 dark:text-gray-400 scale-90'
            }
          `}>
            {t('header.tools')}
          </span>
        </Link>

        {/* Right Nav Item */}
        <Link
          to={sideNavItems[1].path}
          className={`
            flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl
            transition-all duration-200 min-w-[64px] flex-1
            ${isActive(sideNavItems[1].path)
              ? 'text-gray-900 dark:text-white scale-100'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white active:scale-95'
            }
          `}
        >
          <div className="relative">
            <RightIcon
              size={24}
              strokeWidth={isActive(sideNavItems[1].path) ? 2.5 : 2}
              className={`transition-all duration-200 ${isActive(sideNavItems[1].path) ? 'scale-110' : ''}`}
            />
            {isActive(sideNavItems[1].path) && (
              <div className="absolute inset-0 bg-gray-900/30 dark:bg-white/30 blur-lg animate-pulse" />
            )}
          </div>
          <span className={`text-xs font-medium transition-all duration-200 ${isActive(sideNavItems[1].path) ? 'scale-100' : 'scale-90'}`}>
            {sideNavItems[1].label}
          </span>
        </Link>
      </div>
    </nav>
  );
};
