import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { MainLayout, AuthLayout } from '@/shared/layouts';
import { LandingPage } from '@/features/landing';
import { ExplorePage } from '@/features/explore';
import { EditPage, BrushEditPage } from '@/features/edit';
import { GeneratePage } from '@/features/generate';
import { ToolsPage, ThumbnailGeneratorPage, InstagramCoverGeneratorPage, ProductImageGeneratorPage } from '@/features/tools';
import { ProfilePage } from '@/features/profile';
import { UpgradePage } from '@/features/upgrade';
import { SubscriptionPage } from '@/features/subscription';
import { LoginPage } from '@/features/auth';
import { UpscalePage } from '@/features/upscale';
import { ImageToPromptPage } from '@/features/enhance';
import { PrivacyPage, TermsPage, AboutPage, ContactPage, CheckoutPage, PaymentSuccessPage, PaymentFailedPage, PaymentCancelledPage } from '@/features/legal';
import { useAuthStore } from '@/shared/stores';
import { useAuthInit, useAppInit, useFirebaseInit, useCharacterInit } from '@/shared/hooks';
import { ReactNode } from 'react';

// Wrapper component to handle edit mode routing
function EditModeWrapper() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');

  if (mode === 'brush') {
    return <BrushEditPage />;
  }

  return <EditPage />;
}

// Protected Route wrapper - redirects to login if not authenticated
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  // Initialize app settings (theme and language) from system/browser preferences
  useAppInit();

  // Initialize authentication state from localStorage
  useAuthInit();

  // Initialize Firebase
  useFirebaseInit();

  // Initialize characters from server
  useCharacterInit();

  const { isLoading, isAuthenticated } = useAuthStore();

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes - Only accessible when NOT authenticated */}
        <Route element={<AuthLayout />}>
          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
            }
          />
        </Route>

        {/* Main Routes - Public and Protected */}
        <Route element={<MainLayout />}>
          {/* Public Routes - Accessible without authentication */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/subscription" element={<SubscriptionPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/payment/failed" element={<PaymentFailedPage />} />
          <Route path="/payment/cancelled" element={<PaymentCancelledPage />} />

          {/* Protected Routes - Require authentication */}
          <Route
            path="/tools/thumbnail-generator"
            element={
              <ProtectedRoute>
                <ThumbnailGeneratorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tools/instagram-cover-generator"
            element={
              <ProtectedRoute>
                <InstagramCoverGeneratorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tools/product-image-generator"
            element={
              <ProtectedRoute>
                <ProductImageGeneratorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upscale"
            element={
              <ProtectedRoute>
                <UpscalePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/image-to-prompt"
            element={
              <ProtectedRoute>
                <ImageToPromptPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/generate"
            element={
              <ProtectedRoute>
                <GeneratePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit"
            element={
              <ProtectedRoute>
                <EditModeWrapper />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upgrade"
            element={
              <ProtectedRoute>
                <UpgradePage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
