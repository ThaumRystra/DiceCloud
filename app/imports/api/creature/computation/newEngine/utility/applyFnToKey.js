import { get } from 'lodash';

export function applyFnToKey(doc, key, fn){
  if (key.includes('$.')){
    applyToArrayKey(doc, key, fn);
  } else {
    applyToSingleKey(doc, key, fn);
  }
}

function applyToSingleKey(doc, key, fn){
  // call the function with the current value and document for context
  fn(doc, key);
}

/**
 * Applies the given function to all instances in a document key
 * key.$.with.$.subdocs will apply to all key[i...n].with[j...m].subdocs
 */
function applyToArrayKey(doc, key, fn){
  const keySplit = key.split('.$');

  // Stack based depth first traversal of arrays
  const stack = [{
    array: get(doc, keySplit[0]),
    paths: keySplit.slice(1),
    currentPath: keySplit[0],
    indices: [],
  }];
  while(stack.length){
    const state = stack.pop();
    for (let index in state.array.length){
      const currentPath = `${state.currentPath}[${index}]${state.paths[0]}`
      if (state.paths.length == 1){
        applyToSingleKey(doc, currentPath, fn);
      } else {
        stack.push({
          array: get(doc, currentPath),
          paths: state.paths.slice(1),
          currentPath,
          indices: [...state.indices, index],
        });
      }
    }
  }
}
