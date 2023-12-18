import resolve, { toString, traverse, map } from '../resolve';
import constant from './constant';

// Which operators can be considered commutative by the parser
// i.e. 1 + 2 + 3 === 2 + 3 + 1
const commutativeOperators = ['+', '*']

const operator = {
  create({ left, right, operator }) {
    return {
      parseType: 'operator',
      left,
      right,
      operator,
    };
  },
  resolve(fn, node, scope, context) {
    const { result: leftNode } = resolve(fn, node.left, scope, context);
    const { result: rightNode } = resolve(fn, node.right, scope, context);
    let left, right;

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
  toString(node) {
    let { left, right, operator } = node;
    // special case of adding a negative number
    if (operator === '+' && right.valueType === 'number' && right.value < 0) {
      return `${toString(left)} - ${-right.value}`
    }
    return `${toString(left)} ${operator} ${toString(right)}`;
  },
  traverse(node, fn) {
    fn(node);
    traverse(node.left, fn);
    traverse(node.right, fn);
  },
  map(node, fn) {
    const resultingNode = fn(node);
    if (resultingNode === node) {
      node.left = map(node.left, fn);
      node.right = map(node.right, fn);
    }
    return resultingNode;
  },
}

function applyOperator(operator, left, right) {
  let result;
  switch (operator) {
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

function reorderCommutativeOperations(node, leftNode, rightNode) {
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
