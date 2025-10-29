let inMemoryAccessToken: string | null = null
let inMemoryRefreshToken: string | null = null

export function setAccessToken(token: string | null) {
  inMemoryAccessToken = token
  try {
    if (token === null) localStorage.removeItem('accessToken')
    else localStorage.setItem('accessToken', token)
  } catch (e) {
    // localStorage might be unavailable (Safari private mode, strict settings)
    // Keep in-memory value as fallback
    console.warn('[tokenStore] Failed to persist access token to localStorage:', (e as Error)?.message)
  }
}

export function setRefreshToken(token: string | null) {
  inMemoryRefreshToken = token
  try {
    if (token === null) localStorage.removeItem('refreshToken')
    else localStorage.setItem('refreshToken', token)
  } catch (e) {
    console.warn('[tokenStore] Failed to persist refresh token to localStorage:', (e as Error)?.message)
  }
}

export function getAccessToken(): string | null {
  try {
    const ls = localStorage.getItem('accessToken')
    if (ls) return ls
  } catch {}
  return inMemoryAccessToken
}

export function getRefreshToken(): string | null {
  try {
    const ls = localStorage.getItem('refreshToken')
    if (ls) return ls
  } catch {}
  return inMemoryRefreshToken
}

export function clearTokens() {
  setAccessToken(null)
  setRefreshToken(null)
}
