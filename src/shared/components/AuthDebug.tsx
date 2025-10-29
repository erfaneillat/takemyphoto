import { useAuthStore } from '@/shared/stores';

/**
 * Debug component to show authentication state
 * Remove this in production
 */
export const AuthDebug = () => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  
  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 9999,
        maxWidth: '300px'
      }}
    >
      <div><strong>Auth Debug</strong></div>
      <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
      <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
      <div>User: {user ? user.phoneNumber : 'None'}</div>
      <div>Token: {localStorage.getItem('accessToken') ? 'Exists' : 'None'}</div>
    </div>
  );
};
