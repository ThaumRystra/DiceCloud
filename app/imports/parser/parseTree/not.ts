import constant from '/imports/parser/parseTree/constant';
import type { ParseNode } from '/imports/parser/parseTree/ParseNode';
import type { ResolveFunction } from '/imports/parser/types/ResolveFunction';
import type { ParseNodeFactory } from '/imports/parser/types/ParseNodeFactory';

export type NotNode = {
  parseType: 'not';
  right: ParseNode;
}

type NotFactory = ParseNodeFactory<NotNode> & {
  resolve: ResolveFunction<NotNode>;
}

const not: NotFactory = {
  create({ right }: { right: ParseNode }) {
    return {
      parseType: 'not',
      right,
    }
  },
  async resolve(fn, node, scope, context, inputProvider, resolveOthers) {
    const { result: right } = await resolveOthers(fn, node.right, scope, context, inputProvider);
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
  toString(node, stringOthers) {
    return `!${stringOthers(node.right)}`;
  },
  traverse(node, fn, traverseOthers) {
    fn(node);
    traverseOthers(node.right, fn);
  },
  async map(node, fn, mapOthers) {
    const resultingNode = await fn(node);
    if (resultingNode === node) {
      node.right = await mapOthers(node.right, fn);
    }
    return resultingNode;
  },
}

export default not;
