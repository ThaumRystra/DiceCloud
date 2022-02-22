import resolve, { toString, traverse, map } from '../resolve.js';
import constant from './constant.js';

const unaryOperator = {
  create({operator, right}) {
    return {
      parseType: 'unaryOperator',
      operator,
      right,
    };
  },
  resolve(fn, node, scope, context){
    const {result: rightNode} = resolve(fn, node.right, scope, context);
    if (rightNode.valueType !== 'number'){
      return {
        result: unaryOperator.create({
          operator: node.operator,
          right: rightNode,
        }),
        context,
      };
    }
    let right = rightNode.value;
    let result;
    switch(node.operator){
      case '-': result = -right; break;
      case '+': result = +right; break;
    }
    return {
      result: constant.create({
        value: result,
        parseType: typeof result,
      }),
      context,
    };
  },
  toString(node){
    return `${node.operator}${toString(node.right)}`;
  },
  traverse(node, fn){
    fn(node);
    traverse(node.right, fn);
  },
  map(node, fn){
    const resultingNode = fn(node);
    if (resultingNode === node){
      node.right = map(node.right, fn);
    }
    return resultingNode;
  },
};

export default unaryOperator;
