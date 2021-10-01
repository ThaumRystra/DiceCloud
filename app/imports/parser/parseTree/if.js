import resolve, {traverse, toString, mergeResolvedNodes} from '../resolve';
import collate from '/imports/api/engine/computation/utility/collate.js';

const ifNode = {
  create({condition, consequent, alternative}){
    return {
      type: 'if',
      condition,
      consequent,
      alternative,
    };
  },
  toString(node){
    let {condition, consequent, alternative} = node;
    return `${toString(condition)} ? ${toString(consequent)} : ${toString(alternative)}`
  },
  resolve(fn, node, scope){
    let rest, condition, consequent, alternative;
    let resolved = {};

    ({result: condition, ...rest} = resolve(fn, node.condition, scope));
    mergeResolvedNodes(resolved, rest);

    if (condition.type === 'constant'){
      if (condition.value){
        ({result: consequent, ...rest} = resolve(fn, node.consequent, scope));
        mergeResolvedNodes(resolved, rest);
        return {
          result: consequent,
          ...resolved
        };
      } else {
        ({result: alternative, ...rest} = resolve(fn, node.alternative, scope));
        mergeResolvedNodes(resolved, rest);
        return {
          result: alternative,
          ...resolved
        };
      }
    } else {
      return {
        result: ifNode.create({
          condition: condition,
          consequent: node.consequent,
          alternative: node.alternative,
        }),
        ...resolved
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
