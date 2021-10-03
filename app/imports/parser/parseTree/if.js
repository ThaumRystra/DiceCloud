import resolve, { traverse, toString } from '../resolve';

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
}

export default ifNode;
