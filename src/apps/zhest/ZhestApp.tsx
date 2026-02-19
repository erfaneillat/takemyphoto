import { Routes, Route } from 'react-router-dom';
import { ZhestLayout } from './layouts/ZhestLayout';
import { ZhestHomePage } from './pages/ZhestHomePage';
import { LicenseActivationPage } from './pages/LicenseActivationPage';
import { useLicenseStore } from './stores/useLicenseStore';
import { LicenseExpiredPage } from './pages/LicenseExpiredPage';

export const ZhestApp = () => {
    const { isActivated, isExpired } = useLicenseStore();

    // If not activated, lock the entire app on the activation page
    if (!isActivated) {
        return (
            <Routes>
                <Route path="*" element={<LicenseActivationPage />} />
            </Routes>
        );
    }

    // If license expired, show expired page
    if (isExpired()) {
        return (
            <Routes>
                <Route path="*" element={<LicenseExpiredPage />} />
            </Routes>
        );
    }

    return (
        <Routes>
            <Route element={<ZhestLayout />}>
                <Route path="/" element={<ZhestHomePage />} />
                {/* Future zhest-specific routes go here */}
                <Route path="*" element={<ZhestHomePage />} />
            </Route>
        </Routes>
    );
};
