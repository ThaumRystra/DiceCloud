import resolve, { traverse, toString, map, ResolvedResult, Context } from '/imports/parser/resolve';
import error from './error';
import NodeFactory, { ResolveLevel } from '/imports/parser/parseTree/NodeFactory';
import ParseNode from '/imports/parser/parseTree/ParseNode';

export type IndexNode = {
  parseType: 'index';
  array: ParseNode;
  index: ParseNode;
}

interface IndexFactory extends NodeFactory {
  create(node: Partial<IndexNode>): IndexNode;
  compile?: undefined;
  roll?: undefined;
  reduce?: undefined;
  resolve(
    fn: ResolveLevel, node: IndexNode, scope: Record<string, any>, context: Context
  ): ResolvedResult;
  toString(node: IndexNode): string;
  traverse(node: IndexNode, fn: (node: ParseNode) => any): ReturnType<typeof fn>;
  map(node: IndexNode, fn: (node: ParseNode) => any): ReturnType<typeof fn>;
}

const indexNode: IndexFactory = {
  create({ array, index }: { array: ParseNode, index: ParseNode }) {
    return {
      parseType: 'index',
      array,
      index,
    }
  },
  resolve(fn, node, scope, context) {
    const { result: index } = resolve(fn, node.index, scope, context);
    const { result: array } = resolve(fn, node.array, scope, context);

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
      const selection = array.values[index.value - 1];
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
  traverse(node, fn: (node: ParseNode) => any) {
    fn(node);
    traverse(node.array, fn);
    traverse(node.index, fn);
  },
  map(node, fn: (node: ParseNode) => any) {
    const resultingNode = fn(node);
    if (resultingNode === node) {
      node.array = map(node.array, fn);
      node.index = map(node.index, fn);
    }
    return resultingNode;
  },
}

export default indexNode;
