/**
 * Async compatible map that processes all items in parallel
 */
export async function parallelMap(array: any[], fn: (doc: any) => Promise<any>): Promise<any[]> {
  return await Promise.all(array.map(fn));
}

/**
 * Async compatible map that processes all items in series
 */
export async function serialMap(array: any[], fn: (doc: any) => Promise<any>): Promise<any[]> {
  const results: any[] = [];
  for (const doc of array) {
    const result = await fn(doc);
    results.push(result);
  }
  return results;
}

