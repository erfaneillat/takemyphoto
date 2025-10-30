import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from '@/shared/hooks';
import { Button, ImageCard } from '@/shared/components';
import { LogOut, Moon, Sun, Mail, Crown, Settings, Heart, X, User, Users } from 'lucide-react';
import { useFavorites, useGeneratedImages } from './hooks';
import { useThemeStore, useAuthStore } from '@/shared/stores';
import { CharacterForm } from './components/CharacterForm';
import { CharacterList } from './components/CharacterList';

export const ProfilePage = () => {
  const { t, language, changeLanguage } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { theme, toggleTheme } = useThemeStore();
  const { user: authUser, logout } = useAuthStore();
  
  // Get tab from URL or default to 'edits'
  const tabFromUrl = searchParams.get('tab') as 'edits' | 'favorites' | 'characters' | null;
  const [activeTab, setActiveTab] = useState<'edits' | 'favorites' | 'characters'>(
    tabFromUrl || 'edits'
  );

  // Sync tab changes to URL
  useEffect(() => {
    setSearchParams({ tab: activeTab }, { replace: true });
  }, [activeTab, setSearchParams]);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCharacterForm, setShowCharacterForm] = useState(false);
  const { favoriteTemplates, isLoading: loadingFavorites, error: favoritesError } = useFavorites();
  const { images: generatedImages, isLoading: loadingImages, error: imagesError, loadMore, pagination } = useGeneratedImages(20);

  // Get user data from auth store
  const user = {
    email: authUser?.email || 'user@example.com',
    name: authUser?.name || 'User',
    subscription: (authUser?.subscription || 'free') as 'free' | 'pro' | 'premium',
  };

  // Get completed generated images
  const completedImages = generatedImages.filter(img => img.status === 'completed');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };


  return (
    <div className="min-h-screen bg-white dark:bg-black pb-20 lg:pb-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Mobile Action Buttons */}
        <div className="flex gap-3 mb-4 lg:hidden">
          <button
            onClick={() => setShowAccountModal(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-surface-card border border-gray-200 dark:border-border-light rounded-xl hover:bg-gray-50 dark:hover:bg-surface-hover transition-all"
          >
            <User size={20} className="text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">{t('profile.accountInfo')}</span>
          </button>
          <button
            onClick={() => setShowSettingsModal(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-surface-card border border-gray-200 dark:border-border-light rounded-xl hover:bg-gray-50 dark:hover:bg-surface-hover transition-all"
          >
            <Settings size={20} className="text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">{t('profile.settings')}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Sidebar - Hidden on mobile, shown on desktop */}
          <div className="hidden lg:block space-y-4 sm:space-y-6 lg:order-2">
            {/* Account Info */}
            <div className="bg-white dark:bg-surface-card border border-gray-200 dark:border-border-light rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm transition-colors">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Mail size={18} className="text-gray-600 dark:text-gray-400 sm:w-5 sm:h-5" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  {t('profile.accountInfo')}
                </h3>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <div className="p-3 sm:p-4 bg-gray-50 dark:bg-surface rounded-lg">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {t('profile.email')}
                  </label>
                  <p className="text-sm sm:text-base text-gray-900 dark:text-white mt-1 break-all">{user.email}</p>
                </div>
                <div className="p-3 sm:p-4 bg-gray-50 dark:bg-surface rounded-lg">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {t('profile.subscription')}
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    {user.subscription !== 'free' && <Crown size={16} className="text-yellow-600 dark:text-yellow-500" />}
                    <p className="text-sm sm:text-base text-gray-900 dark:text-white font-medium capitalize">
                      {t(`profile.subscriptionStatus.${user.subscription}`)}
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 active:bg-red-100 dark:active:bg-red-900/30 text-sm sm:text-base h-10 sm:h-auto"
                  >
                    <LogOut size={16} className="mr-2" />
                    {t('profile.logout')}
                  </Button>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="bg-white dark:bg-surface-card border border-gray-200 dark:border-border-light rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm transition-colors">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Settings size={18} className="text-gray-600 dark:text-gray-400 sm:w-5 sm:h-5" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  {t('profile.settings')}
                </h3>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-2">
                    {t('profile.theme')}
                  </label>
                  <button
                    onClick={toggleTheme}
                    className="flex items-center justify-between w-full p-3 sm:p-4 bg-gray-50 dark:bg-surface rounded-lg hover:bg-gray-100 dark:hover:bg-surface-hover transition-colors group active:bg-gray-200 dark:active:bg-surface-active"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      {theme === 'dark' ? (
                        <>
                          <div className="p-1.5 sm:p-2 bg-gray-900 dark:bg-surface-elevated rounded-lg group-hover:bg-black dark:group-hover:bg-surface-elevated/150 transition-colors">
                            <Moon size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
                          </div>
                          <span className="text-sm sm:text-base text-gray-900 dark:text-white font-medium">{t('profile.themeOptions.dark')}</span>
                        </>
                      ) : (
                        <>
                          <div className="p-1.5 sm:p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg group-hover:bg-yellow-200 dark:group-hover:bg-yellow-900/50 transition-colors">
                            <Sun size={16} className="text-yellow-600 dark:text-yellow-500 sm:w-[18px] sm:h-[18px]" />
                          </div>
                          <span className="text-sm sm:text-base text-gray-900 dark:text-white font-medium">{t('profile.themeOptions.light')}</span>
                        </>
                      )}
                    </div>
                    <div className="w-11 h-6 sm:w-12 sm:h-6 bg-gray-300 dark:bg-surface-elevated rounded-full relative transition-colors">
                      <div className={`absolute top-1 ${theme === 'dark' ? 'right-1' : 'left-1'} w-4 h-4 bg-white rounded-full transition-all shadow-sm`} />
                    </div>
                  </button>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-2">
                    {t('profile.language')}
                  </label>
                  <select
                    value={language}
                    onChange={(e) => changeLanguage(e.target.value)}
                    className="w-full p-3 sm:p-4 bg-gray-50 dark:bg-surface border border-gray-200 dark:border-border-light rounded-lg text-sm sm:text-base text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent cursor-pointer hover:bg-gray-100 dark:hover:bg-surface-hover transition-colors"
                  >
                    <option value="en">English</option>
                    <option value="fa">فارسی</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 lg:order-1">
            {/* Tabs */}
            <div className="flex gap-2 sm:gap-4 mb-4 sm:mb-6 border-b border-gray-200 dark:border-border-light overflow-x-auto">
              <button
                onClick={() => setActiveTab('edits')}
                className={`pb-2 sm:pb-3 px-2 sm:px-3 font-semibold transition-colors relative whitespace-nowrap text-sm sm:text-base ${activeTab === 'edits'
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
              >
                {t('profile.recentEdits')}
                {activeTab === 'edits' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 dark:bg-white" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('favorites')}
                className={`pb-2 sm:pb-3 px-2 sm:px-3 font-semibold transition-colors relative flex items-center gap-1.5 sm:gap-2 whitespace-nowrap text-sm sm:text-base ${activeTab === 'favorites'
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
              >
                <Heart size={16} className="sm:w-[18px] sm:h-[18px]" />
                {t('profile.favoriteTemplates')}
                {activeTab === 'favorites' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 dark:bg-white" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('characters')}
                className={`pb-2 sm:pb-3 px-2 sm:px-3 font-semibold transition-colors relative flex items-center gap-1.5 sm:gap-2 whitespace-nowrap text-sm sm:text-base ${activeTab === 'characters'
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
              >
                <Users size={16} className="sm:w-[18px] sm:h-[18px]" />
                {t('profile.characters.title')}
                {activeTab === 'characters' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 dark:bg-white" />
                )}
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'characters' ? (
              <CharacterList onCreateClick={() => setShowCharacterForm(true)} />
            ) : activeTab === 'edits' ? (
              <div>
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{t('profile.recentEdits')}</h2>
                  {pagination.hasMore && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadMore}
                      disabled={loadingImages}
                      className="border-gray-300 dark:border-border-light text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-surface-hover text-xs sm:text-sm h-8 sm:h-9"
                    >
                      {loadingImages ? t('common.loading') : t('profile.loadMore')}
                    </Button>
                  )}
                </div>
                
                {loadingImages && completedImages.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 bg-gray-50 dark:bg-surface rounded-xl sm:rounded-2xl px-4">
                    <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                      {t('common.loading')}...
                    </p>
                  </div>
                ) : imagesError ? (
                  <div className="text-center py-8 sm:py-12 bg-red-50 dark:bg-red-900/20 rounded-xl sm:rounded-2xl px-4">
                    <p className="text-red-600 dark:text-red-400 text-sm sm:text-base">
                      {imagesError}
                    </p>
                  </div>
                ) : completedImages.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {completedImages.map((image) => (
                      <ImageCard
                        key={image.id}
                        imageUrl={image.imageUrl}
                        title={image.prompt.substring(0, 50) + (image.prompt.length > 50 ? '...' : '')}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12 bg-gray-50 dark:bg-surface rounded-xl sm:rounded-2xl px-4">
                    <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                      {t('profile.noGeneratedImages')}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{t('profile.favoriteTemplates')}</h2>
                </div>
                
                {loadingFavorites ? (
                  <div className="text-center py-8 sm:py-12 bg-gray-50 dark:bg-surface rounded-xl sm:rounded-2xl px-4">
                    <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                      {t('common.loading')}...
                    </p>
                  </div>
                ) : favoritesError ? (
                  <div className="text-center py-8 sm:py-12 bg-red-50 dark:bg-red-900/20 rounded-xl sm:rounded-2xl px-4">
                    <p className="text-red-600 dark:text-red-400 text-sm sm:text-base">
                      {favoritesError}
                    </p>
                  </div>
                ) : favoriteTemplates.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {favoriteTemplates.map((template) => (
                      <ImageCard
                        key={template.id}
                        imageUrl={template.imageUrl}
                        title={template.prompt}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12 bg-gray-50 dark:bg-surface rounded-xl sm:rounded-2xl px-4">
                    <Heart size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3 sm:mb-4 sm:w-12 sm:h-12" />
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2">
                      {t('profile.noFavorites')}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                      {t('profile.noFavoritesDescription')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Account Info Modal - Mobile Only */}
      {showAccountModal && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-[60] flex items-end lg:hidden">
          <div className="bg-white dark:bg-surface-card w-full rounded-t-2xl p-6 pb-24 shadow-2xl border-t border-gray-200 dark:border-border-light transition-colors animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Mail size={20} className="text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('profile.accountInfo')}
                </h3>
              </div>
              <button
                onClick={() => setShowAccountModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-surface rounded-lg transition-all"
              >
                <X size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 dark:bg-surface rounded-lg">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {t('profile.email')}
                </label>
                <p className="text-sm text-gray-900 dark:text-white mt-1 break-all">{user.email}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-surface rounded-lg">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {t('profile.subscription')}
                </label>
                <div className="flex items-center gap-2 mt-1">
                  {user.subscription !== 'free' && <Crown size={16} className="text-yellow-600 dark:text-yellow-500" />}
                  <p className="text-sm text-gray-900 dark:text-white font-medium capitalize">
                    {t(`profile.subscriptionStatus.${user.subscription}`)}
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 active:bg-red-100 dark:active:bg-red-900/30"
                >
                  <LogOut size={16} className="mr-2" />
                  {t('profile.logout')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal - Mobile Only */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-[60] flex items-end lg:hidden">
          <div className="bg-white dark:bg-surface-card w-full rounded-t-2xl p-6 pb-24 shadow-2xl border-t border-gray-200 dark:border-border-light transition-colors animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Settings size={20} className="text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('profile.settings')}
                </h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-surface rounded-lg transition-all"
              >
                <X size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-2">
                  {t('profile.theme')}
                </label>
                <button
                  onClick={toggleTheme}
                  className="flex items-center justify-between w-full p-3 bg-gray-50 dark:bg-surface rounded-lg hover:bg-gray-100 dark:hover:bg-surface-hover transition-colors group active:bg-gray-200 dark:active:bg-surface-active"
                >
                  <div className="flex items-center gap-2">
                    {theme === 'dark' ? (
                      <>
                        <div className="p-1.5 bg-gray-900 dark:bg-surface-elevated rounded-lg group-hover:bg-black dark:group-hover:bg-surface-elevated/150 transition-colors">
                          <Moon size={16} className="text-white" />
                        </div>
                        <span className="text-sm text-gray-900 dark:text-white font-medium">{t('profile.themeOptions.dark')}</span>
                      </>
                    ) : (
                      <>
                        <div className="p-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg group-hover:bg-yellow-200 dark:group-hover:bg-yellow-900/50 transition-colors">
                          <Sun size={16} className="text-yellow-600 dark:text-yellow-500" />
                        </div>
                        <span className="text-sm text-gray-900 dark:text-white font-medium">{t('profile.themeOptions.light')}</span>
                      </>
                    )}
                  </div>
                  <div className="w-11 h-6 bg-gray-300 dark:bg-surface-elevated rounded-full relative transition-colors">
                    <div className={`absolute top-1 ${theme === 'dark' ? 'right-1' : 'left-1'} w-4 h-4 bg-white rounded-full transition-all shadow-sm`} />
                  </div>
                </button>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-2">
                  {t('profile.language')}
                </label>
                <select
                  value={language}
                  onChange={(e) => changeLanguage(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-surface border border-gray-200 dark:border-border-light rounded-lg text-sm text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent cursor-pointer hover:bg-gray-100 dark:hover:bg-surface-hover transition-colors"
                >
                  <option value="en">English</option>
                  <option value="fa">فارسی</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Character Form Modal */}
      {showCharacterForm && (
        <CharacterForm
          onClose={() => setShowCharacterForm(false)}
          onSuccess={() => setShowCharacterForm(false)}
        />
      )}
    </div>
  );
};
