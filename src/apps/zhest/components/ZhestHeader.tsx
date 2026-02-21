import { useTranslation } from '@/shared/hooks';
import { useThemeStore } from '@/shared/stores';
import { useHomeTabStore } from '@/shared/stores/useHomeTabStore';
import { useLicenseStore } from '../stores/useLicenseStore';
import { Logo } from '@/shared/components/Logo';
import { resolveApiBase } from '@/shared/services/api';
import { Moon, Sun, Search, Sparkles, User, Coins, Download } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export const ZhestHeader = () => {
    const { t } = useTranslation();
    const { theme, toggleTheme } = useThemeStore();
    const { activeTab, setActiveTab } = useHomeTabStore();
    const location = useLocation();
    const navigate = useNavigate();
    const { credit, shopName, logoWithBg, logoWithoutBg } = useLicenseStore();

    const isHomePage = location.pathname === '/';
    const API_BASE = resolveApiBase().replace(/\/api(\/v1)?\/?$/, '');

    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') setDeferredPrompt(null);
    };

    // Choose logo based on availability. We prefer withoutBg for the Zhest header
    const customLogoPath = logoWithoutBg || logoWithBg;
    const logoSrc = customLogoPath ? `${API_BASE}${customLogoPath}` : undefined;

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
        <header className="sticky top-0 z-40 bg-white/70 dark:bg-black/70 backdrop-blur-2xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm transition-all duration-300">
            <div className="flex justify-between items-center px-4 md:px-6 py-3 max-w-7xl mx-auto">
                {/* Logo & Shop Name */}
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="relative transition-transform duration-300 group-hover:scale-105 group-active:scale-95">
                        <Logo size="md" src={logoSrc} />
                    </div>
                    {shopName && (
                        <div className="flex flex-col justify-center">
                            <h1 className="text-lg md:text-xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
                                {shopName}
                            </h1>
                        </div>
                    )}
                </Link>

                {/* Desktop Navigation Tabs - visible on md+ */}
                <nav className="hidden md:flex items-center gap-1 bg-gray-100/50 dark:bg-gray-800/30 p-1 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                    {tabs.map((tab) => {
                        const isActive = isHomePage && activeTab === tab.tabIndex;
                        const Icon = tab.icon;

                        return (
                            <button
                                key={tab.tabIndex}
                                onClick={() => handleTabClick(tab.tabIndex)}
                                className={`
                                    relative flex items-center gap-2 px-5 py-2.5 rounded-xl
                                    transition-all duration-300 text-sm font-semibold overflow-hidden
                                    ${isActive
                                        ? 'text-gray-900 dark:text-white bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-200/50 dark:ring-gray-700/50'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-800/50'
                                    }
                                `}
                            >
                                <Icon
                                    size={18}
                                    strokeWidth={isActive ? 2.5 : 2}
                                    className={`transition-all duration-300 ${isActive ? 'scale-110 text-gray-900 dark:text-white' : ''}`}
                                />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="flex items-center gap-3 md:gap-4">
                    {/* Credit Badge */}
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-2xl text-xs md:text-sm font-bold transition-all duration-300 shadow-sm border ${credit > 5
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200/50 dark:border-gray-700/50 ring-1 ring-gray-200 dark:ring-gray-800'
                        : credit > 0
                            ? 'bg-gray-50 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border-gray-200/50 dark:border-gray-700/50 ring-1 ring-gray-200 dark:ring-gray-800'
                            : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-500 border-gray-200/50 dark:border-gray-800/50 ring-1 ring-gray-100 dark:ring-gray-900'
                        }`}>
                        <span className="tracking-wide">{credit.toLocaleString()}</span>
                        <Coins size={16} strokeWidth={2.5} className={credit > 0 ? "animate-pulse" : ""} />
                    </div>

                    {/* Install App Button */}
                    {deferredPrompt && (
                        <button
                            onClick={handleInstall}
                            className="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm font-bold shadow-md transition-all duration-300"
                            aria-label="Install App"
                        >
                            <Download size={16} strokeWidth={2.5} />
                            <span className="hidden md:inline">Install App</span>
                        </button>
                    )}

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 md:p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700/80 transition-all duration-300 border border-transparent dark:border-gray-700/50 shadow-sm"
                        aria-label="Toggle theme"
                    >
                        <div className="relative w-5 h-5">
                            <Sun
                                size={20}
                                strokeWidth={2.5}
                                className={`absolute inset-0 transition-transform duration-500 ${theme === 'light'
                                    ? 'rotate-0 scale-100 opacity-100'
                                    : 'rotate-90 scale-0 opacity-0'
                                    }`}
                            />
                            <Moon
                                size={20}
                                strokeWidth={2.5}
                                className={`absolute inset-0 transition-transform duration-500 ${theme === 'dark'
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
