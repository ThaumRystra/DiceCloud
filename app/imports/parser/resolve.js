import nodeTypeIndex from './parseTree/_index.js';

// Takes a parse ndoe and computes it to a set detail level
// returns {result, context}
export default function resolve(fn, node, scope, context = new Context()){
  if (!node) return {result: undefined, context};
  let type = nodeTypeIndex[node.parseType];
  if (!type){
    throw new Meteor.Error(`Parse node type: ${node.parseType} not implemented`);
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
    throw new Meteor.Error('Compile not implemented on ' + node.parseType);
  }
}

export function toString(node){
  if (!node) return '';
  let type = nodeTypeIndex[node.parseType];
  if (!type.toString){
    throw new Meteor.Error('toString not implemented on ' + node.parseType);
  }
  return type.toString(node);
}

export function traverse(node, fn){
  if (!node) return;
  let type = nodeTypeIndex[node.parseType];
  if (!type){
    console.error(node);
    throw new Meteor.Error('Not valid parse node');
  }
  if (type.traverse){
    return type.traverse(node, fn);
  }
  return fn(node);
}

export function map(node, fn){
  if (!node) return;
  let type = nodeTypeIndex[node.parseType];
  if (!type){
    console.error(node);
    throw new Meteor.Error('Not valid parse node');
  }
  if (type.map){
    return type.map(node, fn);
  }
  return fn(node);
}

export class Context {
  constructor({errors = [], rolls = [], options = {}} = {}){
    this.errors = errors;
    this.rolls = rolls;
    this.options = options;
  }
  error(e){
    if (!e) return;
    if (typeof e === 'string'){
      this.errors.push({
        type: 'error',
        message: e,
      });
    } else {
      this.errors.push(e);
    }
  }
  roll(r){
    this.rolls.push(r);
  }
}
