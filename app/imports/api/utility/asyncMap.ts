/**
 * Async compatible map that processes all items in parallel
 */
export async function parallelMap<T, U = unknown>(array: T[], fn: (doc: T) => Promise<U>): Promise<U[]> {
  return await Promise.all(array.map(fn));
}

/**
 * Async compatible map that processes all items in series
 */
export async function serialMap<T, U = unknown>(array: T[], fn: (doc: T) => Promise<U>): Promise<U[]> {
  const results: U[] = [];
  for (const doc of array) {
    const result = await fn(doc);
    results.push(result);
  }
  return results;
}

