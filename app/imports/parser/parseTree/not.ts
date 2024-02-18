import resolve, { toString, traverse, map, Context, ResolvedResult } from '/imports/parser/resolve';
import constant from './constant';
import NodeFactory, { ResolveLevel } from '/imports/parser/parseTree/NodeFactory';
import ParseNode from '/imports/parser/parseTree/ParseNode';

export type NotNode = {
  parseType: 'not';
  right: ParseNode;
}

interface NotFactory extends NodeFactory {
  create(node: Partial<NotNode>): NotNode;
  compile?: undefined;
  roll?: undefined;
  reduce?: undefined;
  resolve(
    fn: ResolveLevel, node: NotNode, scope: Record<string, any>, context: Context
  ): ResolvedResult;
  toString(node: NotNode): string;
  traverse(node: NotNode, fn: (node: ParseNode) => any): ReturnType<typeof fn>;
  map(node: NotNode, fn: (node: ParseNode) => any): ReturnType<typeof fn>;
}

const not: NotFactory = {
  create({ right }: { right: ParseNode }) {
    return {
      parseType: 'not',
      right,
    }
  },
  resolve(fn, node, scope, context) {
    const { result: right } = resolve(fn, node.right, scope, context);
    if (right.parseType !== 'constant') {
      return {
        result: not.create({
          right: right,
        }),
        context,
      };
    }
    return {
      result: constant.create({
        value: !right.value,
      }),
      context,
    };
  },
  toString(node) {
    return `!${toString(node.right)}`;
  },
  traverse(node, fn) {
    fn(node);
    traverse(node.right, fn);
  },
  map(node, fn) {
    const resultingNode = fn(node);
    if (resultingNode === node) {
      node.right = map(node.right, fn);
    }
    return resultingNode;
  },
}

export default not;
