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
    console.warn(`Could not set cookie ${name}:`, e);
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
    console.warn(`Could not get cookie ${name}:`, e);
  }
  return null;
}

export function removeCookie(name: string): void {
  if (typeof document === 'undefined') return;
  try {
    document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
  } catch (e) {
    console.warn(`Could not remove cookie ${name}:`, e);
  }
}

export function saveUserLocalData<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  const jsonStr = JSON.stringify(value);

  // 1. Save in localStorage with try/catch (handles Mobile Safari Private mode quota errors)
  try {
    window.localStorage.setItem(key, jsonStr);
  } catch (e) {
    console.warn(`Could not save ${key} to localStorage:`, e);
  }

  // 2. Save in Cookies (if string length is safe for cookies)
  if (jsonStr.length < 3800) {
    setCookie(key, jsonStr);
  }
}

export function getUserLocalData<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;

  // 1. Try Cookie first
  try {
    const cookieVal = getCookie(key);
    if (cookieVal) {
      const parsed = JSON.parse(cookieVal);
      if (parsed !== undefined && parsed !== null) {
        return parsed;
      }
    }
  } catch (e) {}

  // 2. Fallback to localStorage
  try {
    const localVal = window.localStorage.getItem(key);
    if (localVal) {
      const parsed = JSON.parse(localVal);
      if (parsed !== undefined && parsed !== null) {
        return parsed;
      }
    }
  } catch (e) {}

  return fallback;
}
