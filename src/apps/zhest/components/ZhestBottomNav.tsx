import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/shared/hooks';
import { useHomeTabStore } from '@/shared/stores/useHomeTabStore';
import { Search, Sparkles, User, ImageIcon } from 'lucide-react';
import { useInvoiceAlertStore } from '../stores/useInvoiceAlertStore';
import { useEffect } from 'react';

export const ZhestBottomNav = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { activeTab, setActiveTab } = useHomeTabStore();
    const { t } = useTranslation();
    const { pendingCount, fetched, fetch: fetchAlerts } = useInvoiceAlertStore();

    useEffect(() => {
        if (!fetched) fetchAlerts();
    }, [fetched]);

    const isHomePage = location.pathname === '/app' || location.pathname === '/app/';

    const tabs = [
        { label: t('bottomNav.search'), icon: Search, tabIndex: 0 as const },
        { label: t('bottomNav.generate'), icon: Sparkles, tabIndex: 1 as const },
        { label: t('bottomNav.gallery'), icon: ImageIcon, tabIndex: 2 as const },
        { label: t('bottomNav.profile'), icon: User, tabIndex: 3 as const },
    ];

    const handleTabClick = (tabIndex: 0 | 1 | 2 | 3) => {
        if (!isHomePage) {
            navigate('/app');
        }
        setActiveTab(tabIndex);
    };

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-2xl border-t border-gray-200/50 dark:border-gray-800/50 transition-colors">
            <div className="flex justify-around items-center px-4 py-2 safe-area-inset-bottom">
                {tabs.map((tab) => {
                    const isActive = isHomePage && activeTab === tab.tabIndex;
                    const Icon = tab.icon;

                    return (
                        <button
                            key={tab.tabIndex}
                            onClick={() => handleTabClick(tab.tabIndex)}
                            className={`
                relative flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-2xl
                transition-all duration-300 min-w-[64px]
                ${isActive
                                    ? 'text-gray-900 dark:text-white'
                                    : 'text-gray-400 dark:text-gray-500 active:scale-95'
                                }
              `}
                        >
                            {isActive && (
                                <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800/80 rounded-2xl" />
                            )}
                            <div className="relative z-10">
                                <Icon
                                    size={24}
                                    strokeWidth={isActive ? 2.5 : 1.8}
                                    className={`transition-all duration-300 ${isActive ? 'scale-110' : ''}`}
                                />
                                {tab.tabIndex === 3 && pendingCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-black" />
                                )}
                            </div>
                            <span className={`relative z-10 text-[11px] transition-all duration-300 ${isActive ? 'font-semibold' : 'font-medium'}`}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};
