import nodeTypeIndex from './parseTree/index.js';
import collate from '/imports/api/engine/computation/utility/collate.js';
import Context from './ResolveContext.js';

// Takes a parse ndoe and computes it to a set detail level
// returns {result, context}
export default function resolve(fn, node, scope, context = new Context()){
  let type = nodeTypeIndex[node.type];
  if (!type){
    throw new Meteor.Error(`Parse node type: ${node.type} not implemented`);
  }
  if (type.resolve){
    return type.resolve(fn, node, scope, context);
  } else if (type[fn]) {
    return type[fn](node, scope, context);
  } else if (fn === 'reduce' && type.roll) {
    return type.roll(node, scope, context)
  } else if (type.compile){
    return type.compile(node, scope, context)
  } else {
    throw new Meteor.Error('Compile not implemented on ' + node.type);
  }
}

export function toString(node){
  let type = nodeTypeIndex[node.type];
  if (!type.toString){
    throw new Meteor.Error('toString not implemented on ' + node.type);
  }
  return type.toString(node);
}

export function traverse(node, fn){
  let type = nodeTypeIndex[node.type];
  if (type.traverse){
    return type.traverse(node, fn);
  }
  return fn(node);
}

export function mergeResolvedNodes(main, other){
  main.errors = collate(main.errors, other.errors);
  main.rolls = collate(main.rolls, other.rolls);
  return main;
}
