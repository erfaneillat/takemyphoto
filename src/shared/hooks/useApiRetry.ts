export interface RetryOptions {
  maxRetries?: number; // total attempts including first
  baseDelayMs?: number; // initial delay for backoff
  retryOn?: number[];   // HTTP status codes to retry on
  jitter?: boolean;     // add small random jitter
}

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  opts?: RetryOptions
): Promise<Response> {
  const {
    maxRetries = 3,
    baseDelayMs = 1000,
    retryOn = [429, 502, 503, 504],
    jitter = true,
  } = opts || {};

  let lastError: any = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch(input, init);
      if (res.ok) return res;

      // If response is retryable (e.g., 429 Too Many Requests)
      if (retryOn.includes(res.status)) {
        // Respect Retry-After header if present (seconds)
        const retryAfter = res.headers.get('Retry-After');
        let delay = 0;
        if (retryAfter) {
          const seconds = Number(retryAfter);
          if (!Number.isNaN(seconds)) {
            delay = Math.max(0, seconds * 1000);
          }
        }
        if (delay === 0) {
          // Exponential backoff: base * 2^attempt
          delay = baseDelayMs * Math.pow(2, attempt);
          if (jitter) {
            delay += Math.floor(Math.random() * 250);
          }
        }

        if (attempt < maxRetries - 1) {
          // Optional console hint for dev
          // console.warn(`Rate limited (${res.status}). Retrying after ${delay}ms (attempt ${attempt + 2}/${maxRetries})`);
          await sleep(delay);
          continue;
        }
      }

      // Non-retryable or exhausted attempts
      return res;
    } catch (err) {
      lastError = err;
      // Network error: backoff and retry
      if (attempt < maxRetries - 1) {
        const delay = baseDelayMs * Math.pow(2, attempt) + (jitter ? Math.floor(Math.random() * 250) : 0);
        await sleep(delay);
        continue;
      }
      throw err;
    }
  }

  // Should not reach here, but throw last error if it does
  throw lastError || new Error('fetchWithRetry failed');
}
