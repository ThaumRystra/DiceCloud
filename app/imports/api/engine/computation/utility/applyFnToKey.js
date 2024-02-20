import { get } from 'lodash';

export default function applyFnToKey(doc, key, fn) {
  if (key.includes('.$')) {
    applyToArrayKey(doc, key, fn);
  } else {
    applyToSingleKey(doc, key, fn);
  }
}

export async function applyFnToKeyAsync(doc, key, fn) {
  if (key.includes('.$')) {
    await applyToArrayKeyAsync(doc, key, fn);
  } else {
    await applyToSingleKeyAsync(doc, key, fn);
  }
}

function applyToSingleKey(doc, key, fn) {
  // call the function with the current value and document for context
  return fn(doc, key);
}

async function applyToSingleKeyAsync(doc, key, fn) {
  // call the function with the current value and document for context
  return await fn(doc, key);
}

/**
 * Applies the given function to all instances in a document key
 * key.$.with.$.subdocs will apply to all key[i...n].with[j...m].subdocs
 * Warning: Order might be confusing, it will traverse the deepest array in order
 * but the shallower arrays in reverse order
 */
function applyToArrayKey(doc, key, fn) {
  const keySplit = key.split('.$');
  // Stack based depth first traversal of arrays
  const array = get(doc, keySplit[0]);
  if (!array) return;
  const stack = [{
    array,
    paths: keySplit.slice(1),
    currentPath: keySplit[0],
    indices: [],
  }];
  while (stack.length) {
    const state = stack.pop();
    if (!state) break;
    for (let index in state.array) {
      const currentPath = `${state.currentPath}[${index}]${state.paths[0]}`
      if (state.paths.length == 1) {
        applyToSingleKey(doc, currentPath, fn);
      } else {
        const array = get(doc, currentPath);
        if (!array) return;
        stack.push({
          array,
          paths: state.paths.slice(1),
          currentPath,
          indices: [...state.indices, index],
        });
      }
    }
  }
}

async function applyToArrayKeyAsync(doc, key, fn) {
  const keySplit = key.split('.$');
  // Stack based depth first traversal of arrays
  const array = get(doc, keySplit[0]);
  if (!array) return;
  const stack = [{
    array,
    paths: keySplit.slice(1),
    currentPath: keySplit[0],
    indices: [],
  }];
  while (stack.length) {
    const state = stack.pop();
    if (!state) break;
    for (let index in state.array) {
      const currentPath = `${state.currentPath}[${index}]${state.paths[0]}`
      if (state.paths.length == 1) {
        await applyToSingleKey(doc, currentPath, fn);
      } else {
        const array = get(doc, currentPath);
        if (!array) return;
        stack.push({
          array,
          paths: state.paths.slice(1),
          currentPath,
          indices: [...state.indices, index],
        });
      }
    }
  }
}
