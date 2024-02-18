import resolve, { toString, traverse, map, Context, ResolvedResult } from '/imports/parser/resolve';
import constant from './constant';
import NodeFactory, { ResolveLevel } from '/imports/parser/parseTree/NodeFactory';
import ParseNode from '/imports/parser/parseTree/ParseNode';

export type ArrayNode = {
  parseType: 'array';
  values: ParseNode[];
}

interface ArrayFactory extends NodeFactory {
  create(node: Partial<ArrayNode>): ArrayNode;
  fromConstantArray(array: (string | number | boolean | undefined)[]): ArrayNode;
  compile?: undefined;
  roll?: undefined;
  reduce?: undefined;
  resolve(
    fn: ResolveLevel, node: ArrayNode, scope: Record<string, any>, context: Context
  ): ResolvedResult;
  toString(node: ArrayNode): string;
  traverse(node: ArrayNode, fn: (node: ParseNode) => any): ReturnType<typeof fn>;
  map(node: ArrayNode, fn: (node: ParseNode) => any): ReturnType<typeof fn>;
}

const array: ArrayFactory = {
  create({ values }: { values: ParseNode[] }) {
    return {
      parseType: 'array',
      values,
    };
  },
  fromConstantArray(constantArray) {
    const values = constantArray.map(value => {
      const valueType = typeof value;
      if (
        valueType === 'string' ||
        valueType === 'number' ||
        valueType === 'boolean' ||
        valueType === 'undefined'
      ) {
        return constant.create({ value });
      } else {
        // Gracefully create an empty constant in the array for unsupported types
        return constant.create({ value: undefined });
      }
    });
    return array.create({ values });
  },
  resolve(fn, node, scope, context): ResolvedResult {
    const values = node.values.map(node => {
      const { result } = resolve(fn, node, scope, context);
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
