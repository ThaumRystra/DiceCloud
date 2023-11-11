import resolve, { toString, traverse, map } from '../resolve';
import constant from './constant';

const array = {
  create({ values }) {
    return {
      parseType: 'array',
      values,
    };
  },
  fromConstantArray(array) {
    let values = array.map(value => {
      let valueType = typeof value;
      if (
        valueType === 'string' ||
        valueType === 'number' ||
        valueType === 'boolean' ||
        valueType === 'undefined'
      ) {
        return constant.create({ value, valueType });
      } else {
        // Gracefully create an empty spot in the array for unsupported types
        return undefined;
        // throw `Unexpected type in constant array: ${valueType}`
      }
    });
    return array.create({ values });
  },
  resolve(fn, node, scope, context) {
    let values = node.values.map(node => {
      let { result } = resolve(fn, node, scope, context);
      return result;
    });
    return {
      result: array.create({ values }),
      context,
    };
  },
  toString(node) {
    return `[${node.values.map(value => toString(value)).join(', ')}]`;
  },
  traverse(node, fn) {
    fn(node);
    node.values.forEach(value => traverse(value, fn));
  },
  map(node, fn) {
    const resultingNode = fn(node);
    if (resultingNode === node) {
      node.values = node.values.map(value => map(value, fn));
    }
    return resultingNode;
  },
}

export default array;
