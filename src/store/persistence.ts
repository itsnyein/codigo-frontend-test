import type { ZodType } from "zod";

export interface Persistence<T> {
  load: () => T | undefined;
  save: (value: T) => void;
  clear: () => void;
}

function getStorage(): Storage | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

export function createPersistence<T>(
  key: string,
  schema: ZodType<T>,
): Persistence<T> {
  return {
    load() {
      const storage = getStorage();
      if (!storage) return undefined;

      try {
        const raw = storage.getItem(key);
        if (raw === null) return undefined;

        const result = schema.safeParse(JSON.parse(raw));
        return result.success ? result.data : undefined;
      } catch {
        return undefined;
      }
    },

    save(value) {
      const storage = getStorage();
      if (!storage) return;

      try {
        storage.setItem(key, JSON.stringify(value));
      } catch {
        // Persistence is best-effort: a full or disabled store must not break the app.
      }
    },

    clear() {
      const storage = getStorage();
      if (!storage) return;

      try {
        storage.removeItem(key);
      } catch {
        // See save().
      }
    },
  };
}
