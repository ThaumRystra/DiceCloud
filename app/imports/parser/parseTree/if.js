import resolve, { traverse, toString, map } from '../resolve';

const ifNode = {
  create({condition, consequent, alternative}){
    return {
      parseType: 'if',
      condition,
      consequent,
      alternative,
    };
  },
  toString(node){
    let {condition, consequent, alternative} = node;
    return `${toString(condition)} ? ${toString(consequent)} : ${toString(alternative)}`
  },
  resolve(fn, node, scope, context){
    let {result: condition} = resolve(fn, node.condition, scope, context);

    if (condition.parseType === 'constant'){
      if (condition.value){
        return resolve(fn, node.consequent, scope, context);
      } else {
        return resolve(fn, node.alternative, scope, context);
      }
    } else {
      return {
        result: ifNode.create({
          condition: condition,
          consequent: node.consequent,
          alternative: node.alternative,
        }),
        context,
      };
    }
  },
  traverse(node, fn){
    fn(node);
    traverse(node.condition, fn);
    traverse(node.consequent, fn);
    traverse(node.alternative, fn);
  },
  map(node, fn){
    const resultingNode = fn(node);
    if (resultingNode === node){
      node.condition = map(node.condition, fn);
      node.consequent = map(node.consequent, fn);
      node.alternative = map(node.alternative, fn);
    }
    return resultingNode;
  },
}

export default ifNode;
