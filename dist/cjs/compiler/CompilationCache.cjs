/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

class CompilationCache {
  constructor(initialEntries) {
    this.cache = initialEntries ? new Map(initialEntries) : new Map();
  }
  get(key) {
    return this.cache.get(key);
  }
  set(key, entry) {
    this.cache.set(key, entry);
  }
  get count() {
    return this.cache.size;
  }
  remove(path) {
    this.cache.delete(path);
  }
  clear() {
    this.cache.clear();
  }
}

exports.CompilationCache = CompilationCache;
//# sourceMappingURL=CompilationCache.cjs.map
