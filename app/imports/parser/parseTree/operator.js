import resolve, { toString, traverse, map } from '../resolve.js';
import constant from './constant.js';

const operator = {
  create({left, right, operator, fn}) {
    return {
      parseType: 'operator',
      left,
      right,
      operator,
      fn
    };
  },
  resolve(fn, node, scope, context){
    const {result: leftNode} = resolve(fn, node.left, scope, context);
    const {result: rightNode} = resolve(fn, node.right, scope, context);
    let left, right;
    if (leftNode.parseType !== 'constant' || rightNode.parseType !== 'constant'){
      return {
        result: operator.create({
          left: leftNode,
          right: rightNode,
          operator: node.operator,
          fn: node.fn,
        }),
        context,
      };
    } else {
      left = leftNode.value;
      right = rightNode.value;
    }
    let result;
    switch(node.operator){
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
      case '==':  result = left == right; break;
      case '===': result = left === right; break;
      case '!=':  result = left != right; break;
      case '!==': result = left !== right; break;
      case '>': result = left > right; break;
      case '<': result = left < right; break;
      case '>=': result = left >= right; break;
      case '<=': result = left <= right; break;
    }
    return {
      result: constant.create({
        value: result,
      }),
      context,
    };
  },
  toString(node){
    let {left, right, operator} = node;
    // special case of adding a negative number
    if (operator === '+' && right.valueType === 'number' && right.value < 0){
      return `${toString(left)} - ${-right.value}`
    }
    return `${toString(left)} ${operator} ${toString(right)}`;
  },
  traverse(node, fn){
    fn(node);
    traverse(node.left, fn);
    traverse(node.right, fn);
  },
  map(node, fn){
    const resultingNode = fn(node);
    if (resultingNode === node){
      node.left = map(node.left, fn);
      node.right = map(node.right, fn);
    }
    return resultingNode;
  },
}

export default operator;
