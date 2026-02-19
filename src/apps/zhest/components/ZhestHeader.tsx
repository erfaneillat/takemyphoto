import { useTranslation } from '@/shared/hooks';
import { useThemeStore } from '@/shared/stores';
import { useHomeTabStore } from '@/shared/stores/useHomeTabStore';
import { useLicenseStore } from '../stores/useLicenseStore';
import { Logo } from '@/shared/components/Logo';
import { Moon, Sun, Search, Sparkles, User, Coins } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export const ZhestHeader = () => {
    const { t } = useTranslation();
    const { theme, toggleTheme } = useThemeStore();
    const { activeTab, setActiveTab } = useHomeTabStore();
    const location = useLocation();
    const navigate = useNavigate();
    const { credit } = useLicenseStore();

    const isHomePage = location.pathname === '/';

    const tabs = [
        { label: t('bottomNav.search'), icon: Search, tabIndex: 0 as const },
        { label: t('bottomNav.generate'), icon: Sparkles, tabIndex: 1 as const },
        { label: t('bottomNav.profile'), icon: User, tabIndex: 2 as const },
    ];

    const handleTabClick = (tabIndex: 0 | 1 | 2) => {
        if (!isHomePage) {
            navigate('/');
        }
        setActiveTab(tabIndex);
    };

    return (
        <header className="sticky top-0 z-40 bg-white dark:bg-black backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 shadow-sm transition-colors">
            <div className="flex justify-between items-center px-4 py-3 max-w-7xl mx-auto">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <div className="relative">
                        <Logo size="md" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                        {t('app.title')}
                    </h1>
                </Link>

                {/* Desktop Navigation Tabs - visible on md+ */}
                <nav className="hidden md:flex items-center gap-1">
                    {tabs.map((tab) => {
                        const isActive = isHomePage && activeTab === tab.tabIndex;
                        const Icon = tab.icon;

                        return (
                            <button
                                key={tab.tabIndex}
                                onClick={() => handleTabClick(tab.tabIndex)}
                                className={`
                                    relative flex items-center gap-2 px-4 py-2 rounded-xl
                                    transition-all duration-300 text-sm font-medium
                                    ${isActive
                                        ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800/80'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/40'
                                    }
                                `}
                            >
                                <Icon
                                    size={18}
                                    strokeWidth={isActive ? 2.5 : 1.8}
                                    className={`transition-all duration-300 ${isActive ? 'scale-110' : ''}`}
                                />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="flex items-center gap-2">
                    {/* Credit Badge */}
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${credit > 5
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : credit > 0
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                        <Coins size={14} />
                        <span>{credit}</span>
                    </div>

                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-surface transition-all duration-200"
                        aria-label="Toggle theme"
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
            </div>
        </header>
    );
};
