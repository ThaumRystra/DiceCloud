import constant from './constant.js';
// import array from './array.js';
import { toString } from '../resolve.js';

const accessor = {
  create({name, path}) {
    return {
      parseType: 'accessor',
      path,
      name,
    };
  },
  compile(node, scope, context) {
    let value = scope && scope[node.name];
    // For objects, get their value
    node.path.forEach(name => {
      if (value === undefined) return;
      value = value[name];
    });
    let valueType = Array.isArray(value) ? 'array' : typeof value;
    // If the accessor returns an objet, get the object's value instead
    while (valueType === 'object'){
      value = value.value;
      valueType = Array.isArray(value) ? 'array' : typeof value;
    }
    // Return a parse node based on the type returned
    if (valueType === 'string' || valueType === 'number' || valueType === 'boolean'){
      return {
        result: constant.create({
          value,
          valueType
        }),
        context,
      };
    }
    /* Can't access #object.tags until this is fixed
     * If we activate this, the array node expects values to be an array of
     * parse nodes, so it will break unless the values are coerced here or at 
     * in the array node's code to be parse nodes, not raw js
    else if (valueType === 'array') {
      return {
        result: array.create({
          values: value,
        }),
        context,
      };
    }
    */
    else if (valueType === 'undefined') {
      return {
        result: accessor.create({
          name: node.name,
          path: node.path,
        }),
        context,
      };
    } else {
      context.error(`Accessing ${accessor.toString(node)} is not supported yet`);
      return {
        result: accessor.create({
          name: node.name,
          path: node.path,
        }),
        context,
      };
    }
  },
  reduce(node, scope, context){
    let { result } = accessor.compile(node, scope, context);
    if (result.parseType === 'accessor'){
      context.error(`${toString(result)} not found, set to 0`);
      return {
        result: constant.create({
          value: 0,
        }),
        context
      };
    } else {
      return {result, context};
    }
  },
  toString(node){
    return `${node.name}.${node.path.join('.')}`;
  }
}

export default accessor;
