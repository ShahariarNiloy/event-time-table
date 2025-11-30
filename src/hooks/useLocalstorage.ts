import { useCallback, useEffect, useRef, useState } from "react";

type UseLocalStorageReturn<T> = [
  T,
  (value: T | ((prev: T) => T)) => void,
  () => void
];

// Options for the hook
interface UseLocalStorageOptions<T> {
  serializer?: (value: T) => string;
  deserializer?: (value: string) => T;
  syncData?: boolean;
  initializeWithValue?: boolean;
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {}
): UseLocalStorageReturn<T> {
  const {
    serializer = JSON.stringify,
    deserializer = JSON.parse,
    syncData = true,
    initializeWithValue = true,
  } = options;

  const isFirstRender = useRef(true);

  // Get initial value from localStorage or use provided initialValue
  const readValue = useCallback((): T => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? deserializer(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue, deserializer]);

  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    // For Vite/React, we can initialize immediately if on client
    if (initializeWithValue) {
      return readValue();
    }
    return initialValue;
  });

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        // Save to local storage
        window.localStorage.setItem(key, serializer(valueToStore));

        // Save state
        setStoredValue(valueToStore);

        // Dispatch a custom event for cross-tab communication
        window.dispatchEvent(
          new CustomEvent("local-storage", {
            detail: { key, value: valueToStore },
          })
        );
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, serializer, storedValue]
  );

  // Remove the value from localStorage
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);

      // Dispatch event for cross-tab sync
      window.dispatchEvent(
        new CustomEvent("local-storage", {
          detail: { key, value: null },
        })
      );
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Sync state when localStorage changes (from other tabs/windows)
  useEffect(() => {
    // Skip on first render as we already have the value
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      if ((e as StorageEvent).key && (e as StorageEvent).key !== key) {
        return;
      }

      try {
        const newValue = readValue();
        setStoredValue(newValue);
      } catch (error) {
        console.error(`Error syncing localStorage key "${key}":`, error);
      }
    };

    // Listen to both storage events (for other tabs) and custom events (for same tab)
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(
      "local-storage",
      handleStorageChange as EventListener
    );

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "local-storage",
        handleStorageChange as EventListener
      );
    };
  }, [key, readValue, syncData]);

  return [storedValue, setValue, removeValue];
}
