type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
const memoryCache = new Map<string, CacheEntry<any>>();

function getSessionKey(key: string): string {
  return `luz_cache_${key}`;
}

export const CacheService = {
  get<T>(key: string): T | null {
    // 1. Intentar memoria primero (más rápido)
    const mem = memoryCache.get(key);
    if (mem && Date.now() - mem.timestamp < CACHE_TTL) {
      return mem.data as T;
    }

    // 2. Intentar sessionStorage
    if (typeof window !== 'undefined') {
      try {
        const raw = sessionStorage.getItem(getSessionKey(key));
        if (raw) {
          const entry: CacheEntry<T> = JSON.parse(raw);
          if (Date.now() - entry.timestamp < CACHE_TTL) {
            memoryCache.set(key, entry);
            return entry.data;
          }
          sessionStorage.removeItem(getSessionKey(key));
        }
      } catch {
        // sessionStorage puede fallar (privado, lleno, etc.)
      }
    }

    return null;
  },

  set<T>(key: string, data: T): void {
    const entry: CacheEntry<T> = { data, timestamp: Date.now() };
    memoryCache.set(key, entry);

    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(getSessionKey(key), JSON.stringify(entry));
      } catch {
        // Ignorar errores de sessionStorage
      }
    }
  },

  invalidate(key: string): void {
    memoryCache.delete(key);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem(getSessionKey(key));
      } catch {
        // Ignorar
      }
    }
  },

  invalidateByPrefix(prefix: string): void {
    for (const k of memoryCache.keys()) {
      if (k.startsWith(prefix)) {
        memoryCache.delete(k);
      }
    }
    if (typeof window !== 'undefined') {
      try {
        for (let i = sessionStorage.length - 1; i >= 0; i--) {
          const k = sessionStorage.key(i);
          if (k?.startsWith(getSessionKey(prefix))) {
            sessionStorage.removeItem(k);
          }
        }
      } catch {
        // Ignorar
      }
    }
  },
};
