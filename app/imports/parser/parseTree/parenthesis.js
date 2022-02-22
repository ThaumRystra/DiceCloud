import resolve, { toString, traverse, map } from '../resolve.js';

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
  },
  map(node, fn){
    const resultingNode = fn(node);
    if (resultingNode === node){
      node.content = map(node.content, fn);
    }
    return resultingNode;
  },
}

export default parenthesis;
