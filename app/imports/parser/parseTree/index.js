import resolve, { traverse, toString, map } from '../resolve';
import error from './error';

const indexNode = {
  create({ array, index }) {
    return {
      parseType: 'index',
      array,
      index,
    }
  },
  resolve(fn, node, scope, context) {
    let { result: index } = resolve(fn, node.index, scope, context);
    let { result: array } = resolve(fn, node.array, scope, context);

    if (
      index.valueType === 'number' &&
      Number.isInteger(index.value) &&
      array.parseType === 'array'
    ) {
      if (index.value < 1 || index.value > array.values.length) {
        context.error({
          type: 'warning',
          message: `Index of ${index.value} is out of range for an array` +
            ` of length ${array.values.length}`,
        });
      }
      let selection = array.values[index.value - 1];
      if (selection) {
        return resolve(fn, selection, scope, context);
      }
    } else if (fn === 'reduce') {
      if (array.parseType !== 'array') {
        const message = `Can not get the index of a non-array node: ${toString(node.array)} = ${toString(array)}`
        context.error(message);
        return {
          result: error.create({
            node,
            error: message,
          }),
          context,
        };
      } else if (!index.isInteger) {
        const message = `${toString(array)} is not an integer index of the array`
        context.error(message);
        return {
          result: error.create({
            node,
            error: message,
          }),
          context,
        };
      }
    }
    return {
      result: indexNode.create({
        index,
        array,
      }),
      context,
    };
  },
  toString(node) {
    return `${toString(node.array)}[${toString(node.index)}]`;
  },
  traverse(node, fn) {
    fn(node);
    traverse(node.array, fn);
    traverse(node.index, fn);
  },
  map(node, fn) {
    const resultingNode = fn(node);
    if (resultingNode === node) {
      node.array = map(node.array, fn);
      node.index = map(node.index, fn);
    }
    return resultingNode;
  },
}

export default indexNode;
