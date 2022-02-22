import resolve, { toString, traverse, map } from '../resolve.js';
import constant from './constant.js';

const not = {
  create({right}) {
    return {
      parseType: 'not',
      right,
    }
  },
  resolve(fn, node, scope, context){
    const {result: right} = resolve(fn, node.right, scope, context);
    if (right.parseType !== 'constant'){
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
  toString(node){
    return `!${toString(node.right)}`;
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
}

export default not;
