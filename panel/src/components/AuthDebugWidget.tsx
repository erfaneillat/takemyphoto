import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { getAccessToken } from '@/services/tokenStore';

interface TokenInfo {
  header?: any;
  payload?: any;
  signature?: string;
  isValid: boolean;
  expiresAt?: string;
  error?: string;
}

export const AuthDebugWidget = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [tokenInfo, setTokenInfo] = useState<TokenInfo>({ isValid: false });
  const [showDetails, setShowDetails] = useState(false);

  const compute = () => {
    const token = getAccessToken();
    if (!token) {
      setTokenInfo({ isValid: false, error: 'No token available (tokenStore)' });
      return;
    }

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        setTokenInfo({ isValid: false, error: 'Invalid token format' });
        return;
      }

      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));

      const expiresAt = new Date(payload.exp * 1000);
      const isExpired = expiresAt < new Date();

      setTokenInfo({
        header,
        payload,
        signature: parts[2].substring(0, 20) + '...',
        isValid: !isExpired,
        expiresAt: expiresAt.toISOString(),
        error: isExpired ? 'Token expired' : undefined,
      });
    } catch (error) {
      setTokenInfo({
        isValid: false,
        error: `Failed to decode token: ${(error as Error).message}`,
      });
    }
  }

  useEffect(() => {
    compute();
    // also listen to storage changes (in case other tabs log in/out)
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'accessToken') compute();
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [isAuthenticated, showDetails]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-700 transition"
      >
        🔍 Auth Debug
      </button>

      {showDetails && (
        <div className="absolute bottom-12 right-0 bg-gray-900 text-white rounded-lg shadow-2xl p-4 w-96 max-h-96 overflow-y-auto border border-gray-700">
          <div className="space-y-3 text-sm font-mono">
            <div>
              <span className="text-gray-400">Loading:</span>{' '}
              <span className={useAuthStore.getState().isLoading ? 'text-yellow-400' : 'text-green-400'}>
                {useAuthStore.getState().isLoading ? 'Yes' : 'No'}
              </span>
            </div>

            <div>
              <span className="text-gray-400">Authenticated:</span>{' '}
              <span className={isAuthenticated ? 'text-green-400' : 'text-red-400'}>
                {isAuthenticated ? 'Yes' : 'No'}
              </span>
            </div>

            {user && (
              <>
                <div>
                  <span className="text-gray-400">Email:</span> <span className="text-blue-400">{user.email}</span>
                </div>
                <div>
                  <span className="text-gray-400">Name:</span> <span className="text-purple-400">{user.name}</span>
                </div>
                <div>
                  <span className="text-gray-400">User ID:</span> <span className="text-cyan-400">{user.id}</span>
                </div>
              </>
            )}

            <div className="border-t border-gray-700 pt-3">
              <div className="text-gray-300 font-semibold mb-2">Token Status:</div>
              <div>
                <span className="text-gray-400">Valid:</span>{' '}
                <span className={tokenInfo.isValid ? 'text-green-400' : 'text-red-400'}>
                  {tokenInfo.isValid ? 'Yes' : 'No'}
                </span>
              </div>

              {tokenInfo.error && (
                <div className="text-red-400 mt-2">Error: {tokenInfo.error}</div>
              )}

              {tokenInfo.expiresAt && (
                <div className="mt-2">
                  <span className="text-gray-400">Expires:</span>{' '}
                  <span className="text-yellow-400">{new Date(tokenInfo.expiresAt).toLocaleString()}</span>
                </div>
              )}

              {tokenInfo.payload && (
                <div className="mt-3 bg-gray-800 p-2 rounded border border-gray-700">
                  <div className="text-gray-300 text-xs mb-2">Payload:</div>
                  <div className="text-xs text-gray-300 space-y-1">
                    {Object.entries(tokenInfo.payload).map(([key, value]) => (
                      <div key={key}>
                        <span className="text-gray-500">{key}:</span>{' '}
                        <span className="text-cyan-300">
                          {typeof value === 'number' && key === 'exp'
                            ? new Date(value * 1000).toISOString()
                            : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tokenInfo.signature && (
                <div className="mt-2 text-gray-500 text-xs">
                  Sig: {tokenInfo.signature}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                const token = getAccessToken();
                if (token) {
                  navigator.clipboard.writeText(token);
                  alert('Token copied to clipboard');
                }
              }}
              className="mt-3 w-full bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-xs font-semibold transition"
            >
              Copy Token
            </button>

            <button
              onClick={() => compute()}
              className="mt-2 w-full bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded text-xs font-semibold transition"
            >
              Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
