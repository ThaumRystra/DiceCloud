import type { ParseNode } from '/imports/parser/parseTree/ParseNode';
import type { ParseNodeFactory } from '/imports/parser/types/ParseNodeFactory';
import type { ResolveLevelFunction } from '/imports/parser/types/ResolveLevelFunction';

export type ConstantValueType = number | string | boolean

export type ConstantNode = {
  parseType: 'constant';
  value: ConstantValueType;
  // TODO replace all `constantNode.valueType` with `typeof constantNode.value`
  valueType: 'number' | 'string' | 'boolean';
  isUndefined?: true;
}

export type FiniteNumberConstantNode = {
  parseType: 'constant';
  value: number;
  // TODO replace all `constantNode.valueType` with `typeof constantNode.value`
  valueType: 'number';
}

type ConstantFactory = ParseNodeFactory<ConstantNode, {
  value: ConstantValueType, isUndefined?: true
}> & {
  compile: ResolveLevelFunction<ConstantNode>;
}

const constant: ConstantFactory = {
  create({ value, isUndefined }): ConstantNode {
    return {
      parseType: 'constant',
      valueType: typeof value as 'number' | 'string' | 'boolean',
      value: value ?? 0,
      ...isUndefined && { isUndefined: true }
    }
  },
  async compile(node, scope, context) {
    return Promise.resolve({ result: node, context });
  },
  traverse(node, fn) {
    return fn(node);
  },
  toString(node) {
    return `${node.value}`;
  },
  map(node, fn) {
    return fn(node);
  }
}

export function isFiniteNode(node: ParseNode | undefined): node is FiniteNumberConstantNode {
  return node
    && node.parseType === 'constant'
    && node.valueType === 'number'
    && typeof node.value === 'number'
    && isFinite(node.value)
    || false;
}

export default constant;
