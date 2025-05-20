// Cache utility for global data caching
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

class Cache {
  private static instance: Cache;
  private cache: Map<string, CacheItem<any>>;
  private readonly DEFAULT_DURATION = 30000; // 30 seconds

  private constructor() {
    this.cache = new Map();
  }

  static getInstance(): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache();
    }
    return Cache.instance;
  }

  set<T>(key: string, data: T, duration: number = this.DEFAULT_DURATION): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now() + duration
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.timestamp) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  clear(): void {
    this.cache.clear();
  }

  remove(key: string): void {
    this.cache.delete(key);
  }
}

export const cache = Cache.getInstance(); 