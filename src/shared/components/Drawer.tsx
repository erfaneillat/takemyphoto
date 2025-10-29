import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '@/shared/hooks';
import { 
  LayoutDashboard, 
  Users, 
  Heart, 
  ImagePlus, 
  Mic, 
  Video, 
  Code,
  Sparkles,
  Menu,
  X
} from 'lucide-react';

interface NavItem {
  key: string;
  icon: React.ReactNode;
  path: string;
}

export const Drawer = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const startedHereItems: NavItem[] = [
    { key: 'dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { key: 'community', icon: <Users size={20} />, path: '/explore' },
    { key: 'favorites', icon: <Heart size={20} />, path: '/profile' },
  ];

  const aiToolsItems: NavItem[] = [
    { key: 'imageGenerator', icon: <ImagePlus size={20} />, path: '/edit' },
    { key: 'voiceClone', icon: <Mic size={20} />, path: '/edit' },
    { key: 'videoGenerate', icon: <Video size={20} />, path: '/edit' },
    { key: 'codeGenerate', icon: <Code size={20} />, path: '/edit' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-sidebar text-foreground-light rounded-lg shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Drawer */}
      <div
        className={`fixed lg:sticky top-0 left-0 h-screen bg-sidebar text-foreground-light w-64 flex flex-col transition-transform duration-300 z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center shadow-lg shadow-foreground/30">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold">{t('app.title')}</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4">
          {/* Started Here Section */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider mb-3 px-3">
              {t('drawer.startedHere')}
            </h3>
            <nav className="space-y-1">
              {startedHereItems.map((item) => (
                <Link
                  key={item.key}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    isActive(item.path)
                      ? 'bg-foreground text-white font-medium shadow-md shadow-foreground/20'
                      : 'text-foreground-light/70 hover:bg-sidebar-hover hover:text-foreground-light'
                  }`}
                >
                  {item.icon}
                  <span className="text-sm">{t(`drawer.${item.key}`)}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* AI Tools Featured Section */}
          <div>
            <h3 className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider mb-3 px-3">
              {t('drawer.aiToolsFeatured')}
            </h3>
            <nav className="space-y-1">
              {aiToolsItems.map((item, index) => (
                <Link
                  key={item.key}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    index === 0 || isActive(item.path)
                      ? 'bg-foreground text-white font-medium shadow-md shadow-foreground/20'
                      : 'text-foreground-light/70 hover:bg-sidebar-hover hover:text-foreground-light'
                  }`}
                >
                  {item.icon}
                  <span className="text-sm">{t(`drawer.${item.key}`)}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom Promo Section */}
        <div className="p-4">
          {/* Promo Image/Card */}
          <div className="bg-foreground/20 rounded-xl p-4 mb-3 border border-foreground/30">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-3 bg-foreground/30 rounded-lg flex items-center justify-center">
                <Sparkles size={48} className="text-foreground" />
              </div>
              <p className="text-white font-bold text-sm mb-1">{t('drawer.upgradePromo')}</p>
              <p className="text-white/70 text-xs">{t('drawer.upgradeCoupon')}</p>
            </div>
          </div>

          {/* Upgrade Button */}
          <Link
            to="/upgrade"
            className="w-full block text-center bg-foreground hover:bg-foreground/90 text-white font-medium py-2.5 rounded-lg transition-all shadow-lg shadow-foreground/20 hover:shadow-foreground/30"
          >
            {t('drawer.upgradeToPro')}
          </Link>
        </div>
      </div>
    </>
  );
};
