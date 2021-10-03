import resolve, { toString, traverse } from '../resolve.js';
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
  }
}

export default not;
