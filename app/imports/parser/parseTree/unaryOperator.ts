import resolve, { toString, traverse, map, Context, ResolvedResult } from '/imports/parser/resolve';
import constant from './constant';
import NodeFactory, { ResolveLevel } from '/imports/parser/parseTree/NodeFactory';
import ParseNode from '/imports/parser/parseTree/ParseNode';

type UnaryOperatorSymbol = '+' | '-';

export type UnaryOperatorNode = {
  parseType: 'unaryOperator';
  operator: UnaryOperatorSymbol;
  right: ParseNode;
}

interface UnaryOperatorFactory extends NodeFactory {
  create(node: Partial<UnaryOperatorNode>): UnaryOperatorNode;
  compile?: undefined;
  roll?: undefined;
  reduce?: undefined;
  resolve(
    fn: ResolveLevel, node: UnaryOperatorNode, scope: Record<string, any>, context: Context
  ): ResolvedResult;
  toString(node: UnaryOperatorNode): string;
  traverse(node: UnaryOperatorNode, fn: (node: ParseNode) => any): ReturnType<typeof fn>;
  map(node: UnaryOperatorNode, fn: (node: ParseNode) => any): ReturnType<typeof fn>;
}

const unaryOperator: UnaryOperatorFactory = {
  create({ operator, right }: { operator: UnaryOperatorSymbol, right: ParseNode }) {
    return {
      parseType: 'unaryOperator',
      operator,
      right,
    };
  },
  resolve(fn, node, scope, context) {
    const { result: rightNode } = resolve(fn, node.right, scope, context);
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
  toString(node) {
    return `${node.operator}${toString(node.right)}`;
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
};

export default unaryOperator;
