import resolve, { toString, traverse } from '../resolve.js';

const parenthesis = {
  create({content}) {
    return {
      parseType: 'parenthesis',
      content,
    };
  },
  resolve(fn, node, scope, context){
    const {result: content} = resolve(fn, node.content, scope, context);
    if (
      fn === 'reduce' ||
      content.parseType === 'constant' ||
      content.parseType === 'error'
    ){
      return {result: content, context};
    } else {
      return {
        result: parenthesis.create({content}),
        context
      };
    }
  },
  toString(node){
    return `(${toString(node.content)})`;
  },
  traverse(node, fn){
    fn(node);
    traverse(node.content, fn);
  }
}

export default parenthesis;
