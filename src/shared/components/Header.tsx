import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/shared/hooks';
import { useThemeStore, useAuthStore } from '@/shared/stores';
import { Logo } from './Logo';
import { Menu, X, Compass, User, Star, Moon, Sun, Wand2, ImagePlus, Wrench, LogIn, CreditCard } from 'lucide-react';

export const Header = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();
  const { user, isAuthenticated } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };



  const navLinks = [
    { path: '/explore', label: t('header.explore'), icon: Compass },
    { path: '/tools', label: t('header.tools'), icon: Wrench },
    { path: '/generate', label: t('header.generate'), icon: ImagePlus },
    { path: '/edit', label: t('header.edit'), icon: Wand2 },
    { path: '/subscription', label: t('header.pricing'), icon: CreditCard },
    { path: '/profile', label: t('header.profile'), icon: User },
  ];

  const userStars = user?.stars || 0;

  return (
    <header className="sticky top-0 z-[1000] bg-white dark:bg-black backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group"
          >
            <div className="relative transition-transform group-hover:scale-110 group-hover:rotate-12 duration-300">
              <Logo size="lg" />
              <div className="absolute inset-0 bg-gray-900/20 dark:bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              {t('app.title')}
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`
                  relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
                  transition-all duration-200
                  ${isActive(path)
                    ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-900'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900/50'
                  }
                `}
              >
                <Icon size={18} className="transition-transform group-hover:scale-110" />
                {label}
                {isActive(path) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-gray-900 dark:bg-white rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Stars/Login & Theme Toggle */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/subscription')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${user?.subscription === 'pro' || user?.subscription === 'premium'
                  ? 'bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 text-yellow-700 dark:text-yellow-400 hover:from-yellow-200 hover:to-amber-200 dark:hover:from-yellow-900/50 dark:hover:to-amber-900/50'
                  : 'bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800'
                  }`}
                title={t('header.viewStars')}
              >
                <Star size={16} className="fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-semibold">
                  {userStars.toLocaleString()}
                </span>
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all duration-200"
              >
                <LogIn size={16} />
                {t('header.login')}
              </button>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-900 transition-all duration-200 group relative"
              aria-label="Toggle theme"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <div className="relative w-5 h-5">
                <Sun
                  size={20}
                  className={`absolute inset-0 transition-all duration-300 ${theme === 'light'
                    ? 'rotate-0 scale-100 opacity-100'
                    : 'rotate-90 scale-0 opacity-0'
                    }`}
                />
                <Moon
                  size={20}
                  className={`absolute inset-0 transition-all duration-300 ${theme === 'dark'
                    ? 'rotate-0 scale-100 opacity-100'
                    : '-rotate-90 scale-0 opacity-0'
                    }`}
                />
              </div>
            </button>
          </div>

          {/* Mobile Actions: Star + Menu (visible on small screens) */}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              try { navigate('/subscription'); } catch { }
              setTimeout(() => { try { navigate('/subscription'); } catch { } }, 0);
              setTimeout(() => { if (window.location.pathname !== '/subscription') { window.location.assign('/subscription'); } }, 50);
            }}
            onTouchStart={() => {
              setMobileMenuOpen(false);
              try { navigate('/subscription'); } catch { }
              setTimeout(() => { if (window.location.pathname !== '/subscription') { window.location.assign('/subscription'); } }, 0);
            }}
            className="md:hidden h-10 w-10 flex items-center justify-center rounded-lg text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors active:scale-95 relative z-[300] select-none touch-manipulation"
            aria-label="Go to pricing"
            title="Pricing"
          >
            <Star size={24} className="fill-yellow-400 text-yellow-400" />
          </button>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-2">
              {navLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm
                    transition-colors duration-200
                    ${isActive(path)
                      ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-900'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900/50'
                    }
                  `}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
              {isAuthenticated ? (
                <a
                  href="/subscription"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${user?.subscription === 'pro' || user?.subscription === 'premium'
                    ? 'bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 hover:from-yellow-200 hover:to-amber-200 dark:hover:from-yellow-900/50 dark:hover:to-amber-900/50'
                    : 'bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800'
                    }`}
                >
                  <Star size={18} className="fill-yellow-400 text-yellow-400" />
                  <span className={`text-sm font-semibold ${user?.subscription === 'pro' || user?.subscription === 'premium' ? 'text-yellow-700 dark:text-yellow-400' : 'text-gray-900 dark:text-white'}`}>
                    {userStars.toLocaleString()} {t('header.stars')}
                  </span>
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    navigate('/login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all duration-200"
                >
                  <LogIn size={18} />
                  {t('header.login')}
                </button>
              )}
              <button
                onClick={toggleTheme}
                className="flex items-center justify-between px-4 py-3 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? (
                    <>
                      <Moon size={18} />
                      <span className="text-sm font-medium">Dark Mode</span>
                    </>
                  ) : (
                    <>
                      <Sun size={18} />
                      <span className="text-sm font-medium">Light Mode</span>
                    </>
                  )}
                </div>
                <div className="w-11 h-6 bg-gray-300 dark:bg-gray-700 rounded-full relative transition-colors">
                  <div className={`absolute top-1 ${theme === 'dark' ? 'right-1' : 'left-1'} w-4 h-4 bg-white rounded-full transition-all shadow-sm`} />
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
