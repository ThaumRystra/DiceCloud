import constant from '/imports/parser/parseTree/constant';
import type { ParseNode } from '/imports/parser/parseTree/ParseNode';
import type { ResolveFunction } from '/imports/parser/types/ResolveFunction';
import type { ParseNodeFactory } from '/imports/parser/types/ParseNodeFactory';

type UnaryOperatorSymbol = '+' | '-';

export type UnaryOperatorNode = {
  parseType: 'unaryOperator';
  operator: UnaryOperatorSymbol;
  right: ParseNode;
}

type UnaryOperatorFactory = ParseNodeFactory<UnaryOperatorNode> & {
  resolve: ResolveFunction<UnaryOperatorNode>;
}

const unaryOperator: UnaryOperatorFactory = {
  create({ operator, right }: { operator: UnaryOperatorSymbol, right: ParseNode }) {
    return {
      parseType: 'unaryOperator',
      operator,
      right,
    };
  },
  async resolve(fn, node, scope, context, inputProvider, resolveOthers) {
    const { result: rightNode } = await resolveOthers(fn, node.right, scope, context, inputProvider);
    if (
      rightNode.parseType !== 'constant'
      || typeof rightNode.value !== 'number'
    ) {
      return {
        result: unaryOperator.create({
          operator: node.operator,
          right: rightNode,
        }),
        context,
      };
    }
    const right = rightNode.value;
    let result: number;
    switch (node.operator) {
      case '-': result = -right; break;
      case '+': result = +right; break;
    }
    return {
      result: constant.create({
        value: result,
      }),
      context,
    };
  },
  toString(node, stringOthers) {
    return `${node.operator}${stringOthers(node.right)}`;
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
};

export default unaryOperator;
