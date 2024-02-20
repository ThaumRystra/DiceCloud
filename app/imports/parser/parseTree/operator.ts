import constant, { ConstantValueType, isFiniteNode } from '/imports/parser/parseTree/constant';
import ParseNode from '/imports/parser/parseTree/ParseNode';
import ResolveFunction from '/imports/parser/types/ResolveFunction';
import TraverseFunction from '/imports/parser/types/TraverseFunction';
import MapFunction from '/imports/parser/types/MapFunction';
import ToStringFunction from '/imports/parser/types/ToStringFunction';

type OperatorSymbol = '*' | '/' | '^' | '+' | '-' | '%' | '&' | '&&' | '|' | '||' | '=' |
  '==' | '===' | '!=' | '!==' | '>' | '<' | '>=' | '<=';

export type OperatorNode = {
  parseType: 'operator';
  left: ParseNode;
  right: ParseNode;
  operator: OperatorSymbol;
}

type OperatorFactory = {
  create(node: Partial<OperatorNode>): OperatorNode;
  resolve: ResolveFunction<OperatorNode>;
  toString: ToStringFunction<OperatorNode>;
  traverse: TraverseFunction<OperatorNode>;
  map: MapFunction<OperatorNode>;
}

// Which operators can be considered commutative by the parser
// i.e. 1 + 2 + 3 === 2 + 3 + 1
const commutativeOperators = ['+', '*']

const operator: OperatorFactory = {
  create({
    left, right, operator
  }: {
    left: ParseNode, right: ParseNode, operator: OperatorSymbol
  }) {
    return {
      parseType: 'operator',
      left,
      right,
      operator,
    };
  },
  async resolve(fn, node, scope, context, inputProvider, resolveOthers) {
    const { result: leftNode } = await resolveOthers(fn, node.left, scope, context, inputProvider);
    const { result: rightNode } = await resolveOthers(fn, node.right, scope, context, inputProvider);
    let left: ConstantValueType, right: ConstantValueType;

    // If commutation is possible, do it and return that result
    const commutatedResult = reorderCommutativeOperations(node, leftNode, rightNode);
    if (commutatedResult) return { result: commutatedResult, context };

    if (leftNode.parseType !== 'constant' || rightNode.parseType !== 'constant') {
      return {
        result: operator.create({
          left: leftNode,
          right: rightNode,
          operator: node.operator,
        }),
        context,
      };
    } else {
      left = leftNode.value;
      right = rightNode.value;
    }
    const result = applyOperator(node.operator, left, right);
    return {
      result: constant.create({
        value: result,
      }),
      context,
    };
  },
  toString(node, stringOthers) {
    const { left, right, operator } = node;
    // special case of adding a negative number
    if (operator === '+' && isFiniteNode(right) && right.value < 0) {
      return `${stringOthers(left)} - ${-right.value}`
    }
    return `${stringOthers(left)} ${operator} ${stringOthers(right)}`;
  },
  traverse(node, fn, traverseOthers) {
    fn(node);
    traverseOthers(node.left, fn);
    traverseOthers(node.right, fn);
  },
  async map(node, fn, mapOthers) {
    const resultingNode = await fn(node);
    if (resultingNode === node) {
      node.left = await mapOthers(node.left, fn);
      node.right = await mapOthers(node.right, fn);
    }
    return resultingNode;
  },
}

function applyOperator(operator: OperatorSymbol, left: ConstantValueType, right: ConstantValueType) {
  let result;
  if (left === undefined) {
    left = 0;
  }
  if (right === undefined) {
    right = 0;
  }
  switch (operator) {
    // Typescript might complain about these, but they return NaN as expected
    case '+': result = left + right; break;
    case '-': result = left - right; break;
    case '*': result = left * right; break;
    case '/': result = left / right; break;
    case '^': result = Math.pow(left, right); break;
    case '%': result = left % right; break;
    case '&':
    case '&&': result = left && right; break;
    case '|':
    case '||': result = left || right; break;
    case '=':
    case '==': result = left == right; break;
    case '===': result = left === right; break;
    case '!=': result = left != right; break;
    case '!==': result = left !== right; break;
    case '>': result = left > right; break;
    case '<': result = left < right; break;
    case '>=': result = left >= right; break;
    case '<=': result = left <= right; break;
  }
  return result;
}

function reorderCommutativeOperations(
  node: OperatorNode, leftNode: ParseNode, rightNode: ParseNode
) {
  // Make sure the operator is commutative
  if (!commutativeOperators.includes(node.operator)) return;

  // Find the case where one side is constant and the other is an identical operator
  if (leftNode.parseType === 'constant' && rightNode.parseType === 'constant') return;
  let constantNode, operatorNode, opConstant, opOther;
  if (
    rightNode.parseType == 'constant'
    && leftNode.parseType === 'operator'
    && leftNode.operator === node.operator
  ) {
    constantNode = rightNode;
    operatorNode = leftNode;
  } else if (
    leftNode.parseType == 'constant'
    && rightNode.parseType === 'operator'
    && rightNode.operator === node.operator
  ) {
    constantNode = leftNode;
    operatorNode = rightNode;
  } else {
    return;
  }

  // One of the sub nodes of the operator side must be constant
  if (operatorNode.left.parseType === 'constant') {
    opConstant = operatorNode.left;
    opOther = operatorNode.right;
  } else if (operatorNode.right.parseType === 'constant') {
    opConstant = operatorNode.right;
    opOther = operatorNode.left;
  } else {
    return;
  }

  // Apply the operator to the two constant nodes
  const result = applyOperator(node.operator, constantNode.value, opConstant.value);
  return operator.create({
    left: opOther,
    right: constant.create({
      value: result,
    }),
    operator: node.operator,
  });
}

export default operator;
