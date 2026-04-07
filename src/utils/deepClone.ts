function deepClone<T>(source: T): T {
  return structuredClone(source);
}

export { deepClone };
