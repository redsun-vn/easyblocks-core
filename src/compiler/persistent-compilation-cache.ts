import { CompilationCache, CompilationCacheItemValue } from "./CompilationCache";

// LRU cache for compiled components, persists across buildEntry calls
const MAX_CACHE_SIZE = 500;

export class PersistentCompilationCache extends CompilationCache {
  private lruKeys: string[] = [];

  get(key: string): CompilationCacheItemValue | undefined {
    const value = super.get(key);
    if (value !== undefined) {
      // LRU: move key to end
      const idx = this.lruKeys.indexOf(key);
      if (idx !== -1) {
        this.lruKeys.splice(idx, 1);
      }
      this.lruKeys.push(key);
    }
    return value;
  }

  set(key: string, value: CompilationCacheItemValue): void {
    if (this.count >= MAX_CACHE_SIZE && !super.get(key)) {
      const oldest = this.lruKeys.shift();
      if (oldest !== undefined) {
        super.remove(oldest);
      }
    }
    super.set(key, value);
    const idx = this.lruKeys.indexOf(key);
    if (idx !== -1) {
      this.lruKeys.splice(idx, 1);
    }
    this.lruKeys.push(key);
  }

  clear(): void {
    super.clear();
    this.lruKeys = [];
  }
}
