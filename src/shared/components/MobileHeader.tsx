import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/shared/hooks';
import { useThemeStore, useAuthStore } from '@/shared/stores';
import { Sparkles, Star, Moon, Sun, LogIn } from 'lucide-react';

export const MobileHeader = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const userStars = user?.stars || 0;

  return (
    <header className="md:hidden sticky top-0 z-40 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 shadow-sm transition-colors">
      <div className="flex justify-between items-center px-4 py-3">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-2"
        >
          <div className="relative">
            <Sparkles 
              className="text-gray-900 dark:text-white" 
              size={24} 
            />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            {t('app.title')}
          </h1>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-surface transition-all duration-200"
            aria-label="Toggle theme"
          >
            <div className="relative w-5 h-5">
              <Sun 
                size={20} 
                className={`absolute inset-0 transition-all duration-300 ${
                  theme === 'light' 
                    ? 'rotate-0 scale-100 opacity-100' 
                    : 'rotate-90 scale-0 opacity-0'
                }`}
              />
              <Moon 
                size={20} 
                className={`absolute inset-0 transition-all duration-300 ${
                  theme === 'dark' 
                    ? 'rotate-0 scale-100 opacity-100' 
                    : '-rotate-90 scale-0 opacity-0'
                }`}
              />
            </div>
          </button>

          {/* Stars or Login */}
          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => navigate('/subscription')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              aria-label="Go to pricing"
              title="Pricing"
            >
              <Star size={16} className="fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold">{userStars}</span>
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all duration-200"
            >
              <LogIn size={16} />
              {t('header.login')}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
