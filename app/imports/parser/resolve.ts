import nodeTypeIndex from './parseTree/_index';
import ParseNode from '/imports/parser/parseTree/ParseNode';
import { ConstantValueType } from '/imports/parser/parseTree/constant';

// Takes a parse node and computes it to a set detail level
// returns {result, context}
export default function resolve(
  fn: 'roll' | 'reduce' | 'compile',
  node: ParseNode,
  scope: Record<string, any>,
  context = new Context()
): ResolvedResult {
  if (!node) throw 'Node must be supplied';
  const factory = nodeTypeIndex[node.parseType];
  const handlerFunction = factory[fn];
  if (!factory) {
    throw new Meteor.Error(`Parse node type: ${node.parseType} not implemented`);
  }
  if (factory.resolve) {
    return factory.resolve(fn, node, scope, context);
  } else if (handlerFunction) {
    return handlerFunction(node, scope, context);
  } else if (fn === 'reduce' && factory.roll) {
    return factory.roll(node, scope, context)
  } else if (factory.compile) {
    return factory.compile(node, scope, context)
  } else {
    throw new Meteor.Error('Compile not implemented on ' + node.parseType);
  }
}

export function toString(node: ParseNode) {
  if (!node) return '';
  const type = nodeTypeIndex[node.parseType];
  if (!type?.toString) {
    throw new Meteor.Error('toString not implemented on ' + node.parseType);
  }
  return type.toString(node);
}

export function toPrimitiveOrString(node: ParseNode): ConstantValueType {
  if (!node) return '';
  if (node.parseType === 'constant') return node.value;
  if (node.parseType === 'error') return undefined;
  return toString(node);
}

export function traverse(node: ParseNode, fn: (ParseNode) => any): ReturnType<typeof fn> {
  if (!node) return;
  const type = nodeTypeIndex[node.parseType];
  if (!type) {
    console.error(node);
    throw new Meteor.Error('Not valid parse node');
  }
  if (type.traverse) {
    return type.traverse(node, fn);
  }
  return fn(node);
}

export function map(node: ParseNode, fn: (ParseNode) => any): ReturnType<typeof fn> {
  if (!node) return;
  const type = nodeTypeIndex[node.parseType];
  if (!type) {
    console.error(node);
    throw new Meteor.Error('Not valid parse node');
  }
  if (type.map) {
    return type.map(node, fn);
  }
  return fn(node);
}

export type ResolvedResult = {
  result: ParseNode,
  context: Context
}

export class Context {
  errors: (Error | { type: string, message: string })[];
  rolls: { number: number, diceSize: number, values: number[] }[];
  options: { [key: string]: any };

  constructor({ errors = [], rolls = [], options = {} } = {}) {
    this.errors = errors;
    this.rolls = rolls;
    this.options = options;
  }

  error(e: Error | string) {
    if (!e) return;
    if (typeof e === 'string') {
      this.errors.push({
        type: 'error',
        message: e,
      });
    } else {
      this.errors.push(e);
    }
  }

  roll(r) {
    this.rolls.push(r);
  }
}
