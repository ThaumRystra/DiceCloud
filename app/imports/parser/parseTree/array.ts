import { serialMap } from '/imports/api/utility/asyncMap';
import constant from '/imports/parser/parseTree/constant';
import type { ParseNode } from '/imports/parser/parseTree/ParseNode';
import type { ParseNodeFactory } from '/imports/parser/types/ParseNodeFactory';
import type { ResolveFunction } from '/imports/parser/types/ResolveFunction';

export type ArrayNode = {
  parseType: 'array';
  values: ParseNode[];
}

type ArrayFactory = ParseNodeFactory<ArrayNode> & {
  fromConstantArray(array: (string | number | boolean | undefined)[]): ArrayNode;
  resolve: ResolveFunction<ArrayNode>;
}

const arrayFactory: ArrayFactory = {
  create({ values }: { values: ParseNode[] }): ArrayNode {
    return {
      parseType: 'array',
      values,
    };
  },
  fromConstantArray(constantArray) {
    const values = constantArray.map(value => {
      if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
      ) {
        return constant.create({ value });
      } else {
        // Gracefully create an empty constant in the array for unsupported types
        return constant.create({ value: 0, isUndefined: true });
      }
    });
    return arrayFactory.create({ values });
  },
  async resolve(fn, node, scope, context, inputProvider, resolveOthers) {
    const values: ParseNode[] = [];
    for (const val of node.values) {
      const { result } = await resolveOthers(fn, val, scope, context, inputProvider);
      values.push(result);
    }
    return {
      result: arrayFactory.create({ values }),
      context,
    };
  },
  toString(node, toStringOthers) {
    return `[${node.values.map(value => toStringOthers(value)).join(', ')}]`;
  },
  traverse(node, fn, traverseOthers) {
    fn(node);
    node.values.forEach(value => traverseOthers(value, fn));
  },
  async map(node, fn, mapOthers) {
    const resultingNode = await fn(node);
    if (resultingNode === node) {
      node.values = await serialMap(node.values, async value => await mapOthers(value, fn));
    }
    return resultingNode;
  },
}

export default arrayFactory;
