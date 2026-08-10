/**
 * User Local Storage Utility (Cookies + LocalStorage)
 * Stores user presets, history, and application preferences isolated locally on the user's browser device.
 */

export function setCookie(name: string, value: string, days = 365): void {
  try {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `; expires=${date.toUTCString()}`;
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}${expires}; path=/; SameSite=Lax`;
  } catch (e) {
    console.warn(`Could not set cookie ${name}:`, e);
  }
}

export function getCookie(name: string): string | null {
  try {
    const nameEQ = `${encodeURIComponent(name)}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length, c.length));
      }
    }
  } catch (e) {
    console.warn(`Could not get cookie ${name}:`, e);
  }
  return null;
}

export function removeCookie(name: string): void {
  try {
    document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
  } catch (e) {
    console.warn(`Could not remove cookie ${name}:`, e);
  }
}

export function saveUserLocalData<T>(key: string, value: T): void {
  const jsonStr = JSON.stringify(value);
  // 1. Save in localStorage
  try {
    localStorage.setItem(key, jsonStr);
  } catch (e) {
    console.warn(`Could not save ${key} to localStorage:`, e);
  }
  // 2. Save in Cookies (for fallback & explicit cookies storage)
  // Limit cookie size to ~3KB if dataset is small enough
  if (jsonStr.length < 3800) {
    setCookie(key, jsonStr);
  }
}

export function getUserLocalData<T>(key: string, fallback: T): T {
  // 1. Try Cookie first
  const cookieVal = getCookie(key);
  if (cookieVal) {
    try {
      const parsed = JSON.parse(cookieVal);
      if (parsed !== undefined && parsed !== null) {
        return parsed;
      }
    } catch (e) {}
  }
  // 2. Fallback to localStorage
  try {
    const localVal = localStorage.getItem(key);
    if (localVal) {
      const parsed = JSON.parse(localVal);
      if (parsed !== undefined && parsed !== null) {
        return parsed;
      }
    }
  } catch (e) {}

  return fallback;
}
