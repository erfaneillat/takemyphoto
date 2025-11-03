/**
 * Resolves the API base URL for the panel
 * Uses environment variable or falls back to relative path
 */
export const resolveApiBase = (): string => {
  // Use environment variable if set
  if (import.meta.env.VITE_API_BASE_URL) {
    let url = import.meta.env.VITE_API_BASE_URL
    
    // If page is https but env uses http, upgrade to https to avoid mixed content
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && url.startsWith('http://')) {
      try {
        const u = new URL(url)
        u.protocol = 'https:'
        url = u.toString()
      } catch {
        // If URL parsing fails, just replace http:// with https://
        url = url.replace('http://', 'https://')
      }
    }
    
    // Normalize URL - ensure it ends with /api/v1
    if (url.endsWith('/api')) url += '/v1'
    if (url.endsWith('/api/')) url += 'v1'
    
    return url
  }
  
  // Fall back to relative path for production (same-origin)
  // This prevents mixed content issues when the panel is served over HTTPS
  return '/api/v1'
}
