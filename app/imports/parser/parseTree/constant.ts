import NodeFactory from '/imports/parser/parseTree/NodeFactory';
import { Context, ResolvedResult } from '/imports/parser/resolve';

export type ConstantValueType = number | string | boolean | undefined

export type ConstantNode = {
  parseType: 'constant';
  value: ConstantValueType;
  // TODO replace all `constantNode.valueType` with `typeof constantNode.value`
  valueType: 'number' | 'string' | 'boolean' | 'undefined';
}

interface ConstantFactory extends NodeFactory {
  create({ value }: { value: ConstantValueType }): ConstantNode;
  compile(
    node: ConstantNode, scope: Record<string, any>, context: Context
  ): ResolvedResult;
  roll?: undefined;
  reduce?: undefined;
  resolve?: undefined;
  toString(node: ConstantNode): string;
  traverse?: undefined;
  map?: undefined;
}

const constant: ConstantFactory = {
  create({ value }): ConstantNode {
    return {
      parseType: 'constant',
      valueType: typeof value as 'number' | 'string' | 'boolean' | 'undefined',
      value,
    }
  },
  compile(node, scope, context) {
    return { result: node, context };
  },
  toString(node) {
    return `${node.value}`;
  },
}

export default constant;
