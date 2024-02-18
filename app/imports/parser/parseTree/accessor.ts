import constant from './constant';
import array from './array';
import resolve, { Context, ResolvedResult } from '/imports/parser/resolve';
import { getFromScope } from '/imports/api/creature/creatures/CreatureVariables';
import NodeFactory from '/imports/parser/parseTree/NodeFactory';

export type AccessorNode = {
  parseType: 'accessor';
  path?: string[];
  name: string;
}

interface AccessorFactory extends NodeFactory {
  create(node: Partial<AccessorNode>): AccessorNode;
  compile(
    node: AccessorNode, scope: Record<string, any>, context: Context
  ): ResolvedResult;
  roll?: undefined;
  resolve?: undefined;
  reduce(
    node: AccessorNode, scope: Record<string, any>, context: Context
  ): ResolvedResult;
  toString(node: AccessorNode): string;
  traverse?: undefined;
  map?: undefined;
}

const accessor: AccessorFactory = {
  create({ name, path }: { name: string, path?: string[] }): AccessorNode {
    return {
      parseType: 'accessor',
      path,
      name,
    };
  },
  compile(
    node: AccessorNode, scope: Record<string, any>, context: Context
  ): ResolvedResult {
    let value = getFromScope(node.name, scope);
    // Get the value from the given path
    node.path?.forEach(name => {
      if (value === undefined) return;
      value = value[name];
    });
    let valueType = getType(value);
    // If the accessor returns an object, get the object's value instead
    while (valueType === 'object') {
      // Prefer the valueNode over the value
      if (value.valueNode) {
        value = value.valueNode;
      } else {
        value = value.value;
      }
      valueType = getType(value);
    }
    // Return a discovered parse node
    if (valueType === 'parseNode') {
      return {
        result: value,
        context,
      };
    }
    // Return a parse node based on the constant type returned
    if (valueType === 'string' || valueType === 'number' || valueType === 'boolean') {
      return {
        result: constant.create({ value }),
        context,
      };
    }
    // Return a parser array
    if (valueType === 'array') {
      // If the first value is a parse node, assume all the values are
      if (getType(value[0]) === 'parseNode') {
        return {
          result: array.create({
            values: value,
          }),
          context,
        };
      }
      // Create the array from js primitives instead
      return {
        result: array.fromConstantArray(value),
        context,
      };
    }
    if (valueType === 'undefined') {
      // Undefined defaults to zero
      return {
        result: constant.create({
          value: 0,
        }),
        context
      };
    }
    context.error(`Accessing ${accessor.toString(node)} is not supported yet`);
    return {
      result: accessor.create({
        name: node.name,
        path: node.path,
      }),
      context,
    };
  },
  reduce(node, scope, context): ResolvedResult {
    let { result } = accessor.compile(node, scope, context);
    ({ result } = resolve('reduce', result, scope, context));
    if (result.parseType === 'accessor') {
      return {
        result: constant.create({
          value: 0,
        }),
        context
      };
    } else {
      return { result, context };
    }
  },
  toString(node) {
    if (!node.path?.length) return `${node.name}`;
    return `${node.name}.${node.path.join('.')}`;
  }
}

function getType(val) {
  if (!val) return typeof val;
  if (Array.isArray(val)) return 'array';
  if (val.parseType) return 'parseNode';
  return typeof val;
}

export default accessor;
