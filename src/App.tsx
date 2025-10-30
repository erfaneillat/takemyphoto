import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { MainLayout, AuthLayout } from '@/shared/layouts';
import { ExplorePage } from '@/features/explore';
import { EditPage, BrushEditPage } from '@/features/edit';
import { GeneratePage } from '@/features/generate';
import { ToolsPage } from '@/features/tools';
import { ProfilePage } from '@/features/profile';
import { UpgradePage } from '@/features/upgrade';
import { SubscriptionPage } from '@/features/subscription';
import { LoginPage } from '@/features/auth';
import { UpscalePage, ImageToPromptPage } from '@/features/enhance';
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
          <Route path="/" element={<ExplorePage />} />
          <Route path="/explore" element={<Navigate to="/" replace />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/subscription" element={<SubscriptionPage />} />
          <Route path="/upscale" element={<UpscalePage />} />
          <Route path="/image-to-prompt" element={<ImageToPromptPage />} />
          
          {/* Protected Routes - Require authentication */}
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
