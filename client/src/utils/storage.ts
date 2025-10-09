// Utility to safely access localStorage in Next.js (works on both client and server)

type StorageValue = string | null;

export const getLocalStorage = (key: string, defaultValue: string = ''): string => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    try {
      const storedValue = window.localStorage.getItem(key);
      return storedValue !== null ? storedValue : defaultValue;
    } catch (error) {
      console.warn(`Error accessing localStorage key "${key}":`, error);
      return defaultValue;
    }
  }
  return defaultValue; // Return default value during SSR
};

export const setLocalStorage = (key: string, value: string): void => {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }
};

export const removeLocalStorage = (key: string): void => {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }
};
