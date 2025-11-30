export function getLocalStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return fallback;
  }
}

export function setLocalStorage<T>(key: string, value: T): boolean {
  if (typeof window === "undefined") {
    console.warn(
      `Tried setting localStorage key "${key}" but localStorage is not available`
    );
    return false;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
    return false;
  }
}

export function removeLocalStorage(key: string): boolean {
  if (typeof window === "undefined") {
    console.warn(
      `Tried removing localStorage key "${key}" but localStorage is not available`
    );
    return false;
  }

  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
    return false;
  }
}

export function clearLocalStorage(): boolean {
  if (typeof window === "undefined") {
    console.warn("Tried clearing localStorage but it is not available");
    return false;
  }

  try {
    window.localStorage.clear();
    return true;
  } catch (error) {
    console.error("Error clearing localStorage:", error);
    return false;
  }
}

export function getAllLocalStorageKeys(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    return Object.keys(window.localStorage);
  } catch (error) {
    console.error("Error getting localStorage keys:", error);
    return [];
  }
}

export function getLocalStorageSize(): number {
  if (typeof window === "undefined") {
    return 0;
  }

  try {
    let total = 0;
    for (const key in window.localStorage) {
      if (key in window.localStorage) {
        const value = window.localStorage.getItem(key);
        total += key.length + (value?.length || 0);
      }
    }
    return total;
  } catch (error) {
    console.error("Error calculating localStorage size:", error);
    return 0;
  }
}
