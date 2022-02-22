import { get, set, unset, forEachRight, cloneDeep } from 'lodash';

export default function transformFields(src, transformList, reversed = false){
  if (!transformList) return src;
  // don't bash the old document during the transforms
  let doc = cloneDeep(src);
  for(let originalTransform of transformList){
    let transform;
    // Swap to and from when reversing
    if (reversed){
      transform = {
        to: originalTransform.from,
        from: originalTransform.to,
        up: originalTransform.down,
      }
    } else {
      transform = {...originalTransform};
    }
    transformField(src, doc, transform, reversed);
  }
  return doc;
}

export function transformField(src, doc, transform, reversed){
  if (transform.from?.includes('$.')){
    transformArrayField(src, doc, transform, reversed);
  } else {
    transformSingleField(src, doc, transform);
  }
}

function transformSingleField(src, doc, {from, to, up}){
  // Get the value in the `from` path and delete it
  let value = undefined;
  if (from){
    value = get(src, from);
    unset(doc, from);
  }

  // apply the transform function
  if (up){
    value = up(value, src, doc);
  }

  // Store the value in the `to` path or unset it if undefined
  if (to){
    if (value === undefined){
      unset(doc, to);
    } else {
      set(doc, to, value);
    }
  }
}

/**
 * from: 'from.$.here', to: 'to.$.here'
 * where from and to are an [array, of, objects] that each need to be modified
 * documents at 'from.x.here' will map to 'to.x.here'
 * Attempts to support 'from.$.here.$.nested'
 *   by mapping 'from.x.here.y.nest.z.deep' to 'to.y.nest.z.lessDeep'
 * from depth must be >= to depth
 */
function transformArrayField(src, doc, {from, to, up}, reversed){
  const fromSplit = from.split('.$');
  const toSplit = to.split('.$');

  if (toSplit.length > fromSplit.length){
    throw 'Can\'t transform array fields where "to" is deeper than "from"'
  }

  // Stack based depth first traversal of arrays
  const stack = [{
    array: get(src, fromSplit[0]),
    paths: fromSplit.slice(1),
    currentPath: fromSplit[0],
    indices: [],
  }];
  while(stack.length){
    const state = stack.pop();
    // Iterate forwads or backwads defpending on our migration direction
    if (reversed){
      forEachRight(state.array, iterate(stack, state, src, doc, toSplit, up));
    } else {
      state.array?.forEach(iterate(stack, state, src, doc, toSplit, up));
    }
  }
}

function iterate(stack, state, src, doc, toSplit, up){return function(key, index){
  const currentPath = `${state.currentPath}[${index}]${state.paths[0]}`
  if (state.paths.length == 1){
    transformSingleField(src, doc, {
      from: currentPath,
      to: buildToPath(toSplit, [...state.indices, index]),
      up
    });
  } else {
    stack.push({
      array: get(src, currentPath),
      paths: state.paths.slice(1),
      currentPath,
      indices: [...state.indices, index],
    });
  }
}}

function buildToPath(toSplit, indices){
  let toPath =  '';
  let offset = indices.length - toSplit.length + 1;
  toSplit.forEach((path, i) => {
    toPath += `${path}`;
    if (i < toSplit.length - 1){
      toPath += `[${indices[i + offset]}]`
    }
  });
  return toPath;
}
