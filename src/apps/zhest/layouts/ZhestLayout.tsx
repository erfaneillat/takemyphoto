import { Outlet } from 'react-router-dom';
import { ZhestHeader } from '../components/ZhestHeader';
import { ZhestBottomNav } from '../components/ZhestBottomNav';

export const ZhestLayout = () => {
    return (
        <div className="min-h-screen bg-white dark:bg-black transition-colors">
            <ZhestHeader />
            <main className="pb-20 md:pb-0">
                <Outlet />
            </main>
            <ZhestBottomNav />
        </div>
    );
};
