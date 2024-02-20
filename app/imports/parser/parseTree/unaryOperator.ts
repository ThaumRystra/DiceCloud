import constant from '/imports/parser/parseTree/constant';
import ParseNode from '/imports/parser/parseTree/ParseNode';
import ResolveFunction from '/imports/parser/types/ResolveFunction';
import TraverseFunction from '/imports/parser/types/TraverseFunction';
import MapFunction from '/imports/parser/types/MapFunction';
import ToStringFunction from '/imports/parser/types/ToStringFunction';

type UnaryOperatorSymbol = '+' | '-';

export type UnaryOperatorNode = {
  parseType: 'unaryOperator';
  operator: UnaryOperatorSymbol;
  right: ParseNode;
}

type UnaryOperatorFactory = {
  create(node: Partial<UnaryOperatorNode>): UnaryOperatorNode;
  resolve: ResolveFunction<UnaryOperatorNode>;
  toString: ToStringFunction<UnaryOperatorNode>;
  traverse: TraverseFunction<UnaryOperatorNode>;
  map: MapFunction<UnaryOperatorNode>;
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
