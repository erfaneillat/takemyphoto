import { Outlet, useLocation } from 'react-router-dom';
import { Header, MobileHeader, Footer, BottomNavigation } from '@/shared/components';

export const MainLayout = () => {
  const location = useLocation();
  const isEditPage = location.pathname === '/edit';
  const isGeneratePage = location.pathname === '/generate';
  const hideFooter = isEditPage || isGeneratePage;

  return (
    <div className={hideFooter ? "h-screen flex flex-col bg-white dark:bg-black overflow-hidden transition-colors" : "min-h-screen flex flex-col bg-white dark:bg-black transition-colors"}>
      {/* Desktop Header - hidden on mobile */}
      <div className="hidden md:block">
        <Header />
      </div>
      
      {/* Mobile Header - hidden on desktop */}
      <MobileHeader />
      
      <main className={
        hideFooter 
          ? "flex-1 min-h-0 md:mt-0" 
          : "flex-1 pb-20 md:pb-0"
      }>
        <Outlet />
      </main>
      
      {/* Desktop Footer - hidden on mobile */}
      {!hideFooter && (
        <div className="hidden md:block">
          <Footer />
        </div>
      )}
      
      {/* Mobile Bottom Navigation - hidden on desktop */}
      <BottomNavigation />
    </div>
  );
};
