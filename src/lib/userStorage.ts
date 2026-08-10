/**
 * User Local Storage Utility (Cookies + LocalStorage)
 * Stores user presets, history, and application preferences isolated locally on the user's browser device.
 * Fully safe for mobile Safari (including Private Browsing mode and URI decoding resilience).
 */

export function setCookie(name: string, value: string, days = 365): void {
  if (typeof document === 'undefined') return;
  try {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `; expires=${date.toUTCString()}`;
    const encodedName = encodeURIComponent(name);
    const encodedValue = encodeURIComponent(value);
    document.cookie = `${encodedName}=${encodedValue}${expires}; path=/; SameSite=Lax`;
  } catch (e) {
    // Silently catch Safari cookie access errors
  }
}

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  try {
    const nameEQ = `${encodeURIComponent(name)}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        const rawVal = c.substring(nameEQ.length, c.length);
        try {
          return decodeURIComponent(rawVal);
        } catch {
          return rawVal;
        }
      }
    }
  } catch (e) {
    // Silently catch Safari cookie access errors
  }
  return null;
}

export function removeCookie(name: string): void {
  if (typeof document === 'undefined') return;
  try {
    document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
  } catch (e) {}
}

export function saveUserLocalData<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    const jsonStr = JSON.stringify(value);

    // 1. Save in localStorage with try/catch (handles Mobile Safari Private mode quota errors)
    try {
      window.localStorage.setItem(key, jsonStr);
    } catch (e) {}

    // 2. Save in Cookies (if string length is safe for cookies)
    if (jsonStr.length < 3800) {
      setCookie(key, jsonStr);
    }
  } catch (e) {}
}

export function getUserLocalData<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;

  const tryParse = (raw: string | null): T | null => {
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      if (typeof fallback === 'boolean') {
        if (raw === 'true') return true as unknown as T;
        if (raw === 'false') return false as unknown as T;
      }
      if (typeof fallback === 'string') {
        return raw as unknown as T;
      }
      return null;
    }
  };

  // 1. Try Cookie first
  try {
    const cookieVal = getCookie(key);
    const fromCookie = tryParse(cookieVal);
    if (fromCookie !== null && fromCookie !== undefined) {
      return fromCookie;
    }
  } catch (e) {}

  // 2. Fallback to localStorage
  try {
    const localVal = window.localStorage.getItem(key);
    const fromLocal = tryParse(localVal);
    if (fromLocal !== null && fromLocal !== undefined) {
      return fromLocal;
    }
  } catch (e) {}

  return fallback;
}
