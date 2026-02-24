import { Routes, Route, Navigate } from 'react-router-dom';
import { ZhestLayout } from './layouts/ZhestLayout';
import { ZhestHomePage } from './pages/ZhestHomePage';
import { ZhestLandingPage } from './pages/ZhestLandingPage';
import { LicenseActivationPage } from './pages/LicenseActivationPage';
import { useLicenseStore } from './stores/useLicenseStore';
import { LicenseExpiredPage } from './pages/LicenseExpiredPage';
import { AboutPage } from '@/features/legal/pages/AboutPage';
import { TermsPage } from '@/features/legal/pages/TermsPage';
import { PrivacyPage } from '@/features/legal/pages/PrivacyPage';
import { ContactPage } from '@/features/legal/pages/ContactPage';

const ProtectedZhestApp = () => {
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

export const ZhestApp = () => {
    return (
        <Routes>
            {/* Landing Page */}
            <Route path="/" element={<ZhestLandingPage />} />

            {/* Main Application */}
            <Route path="/app/*" element={<ProtectedZhestApp />} />

            {/* Legal / Footer Pages */}
            <Route path="/about" element={<AboutPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Fallback routing */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};
