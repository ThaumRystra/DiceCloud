import error from '/imports/parser/parseTree/error';
import ParseNode from '/imports/parser/parseTree/ParseNode';
import toString from '/imports/parser/toString';
import { isFiniteNode } from '/imports/parser/parseTree/constant';
import ResolveFunction from '/imports/parser/types/ResolveFunction';
import TraverseFunction from '/imports/parser/types/TraverseFunction';
import MapFunction from '/imports/parser/types/MapFunction';
import ToStringFunction from '/imports/parser/types/ToStringFunction';

export type IndexNode = {
  parseType: 'index';
  array: ParseNode;
  index: ParseNode;
}

type IndexFactory = {
  create(node: Partial<IndexNode>): IndexNode;
  resolve: ResolveFunction<IndexNode>;
  toString: ToStringFunction<IndexNode>;
  traverse: TraverseFunction<IndexNode>;
  map: MapFunction<IndexNode>;
}

const indexNode: IndexFactory = {
  create({ array, index }: { array: ParseNode, index: ParseNode }) {
    return {
      parseType: 'index',
      array,
      index,
    }
  },
  async resolve(fn, node, scope, context, inputProvider, resolveOthers) {
    const { result: index } = await resolveOthers(fn, node.index, scope, context, inputProvider);
    const { result: array } = await resolveOthers(fn, node.array, scope, context, inputProvider);

    if (
      isFiniteNode(index) &&
      Number.isInteger(index.value) &&
      array.parseType === 'array'
    ) {
      if (index.value < 1 || index.value > array.values.length) {
        context.error(`Index of ${index.value} is out of range for an array` +
          ` of length ${array.values.length}`);
      }
      const selection = array.values[index.value - 1];
      if (selection) {
        return resolveOthers(fn, selection, scope, context, inputProvider);
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
      } else if (!isFiniteNode(index) || !Number.isInteger(index.value)) {
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
  toString(node, stringOthers) {
    return `${stringOthers(node.array)}[${stringOthers(node.index)}]`;
  },
  traverse(node, fn, traverseOthers) {
    fn(node);
    traverseOthers(node.array, fn);
    traverseOthers(node.index, fn);
  },
  async map(node, fn, mapOthers) {
    const resultingNode = await fn(node);
    if (resultingNode === node) {
      node.array = await mapOthers(node.array, fn);
      node.index = await mapOthers(node.index, fn);
    }
    return resultingNode;
  },
}

export default indexNode;
