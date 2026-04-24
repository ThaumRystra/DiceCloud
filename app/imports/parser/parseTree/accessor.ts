import array from '/imports/parser/parseTree/array';
import constant from '/imports/parser/parseTree/constant';
import type { ParseNode } from '/imports/parser/parseTree/ParseNode';
import type { ParseNodeFactory } from '/imports/parser/types/ParseNodeFactory';
import type { ResolvedResult } from '/imports/parser/types/ResolvedResult';
import type { ResolveLevelFunction } from '/imports/parser/types/ResolveLevelFunction';

const getFromScope = (await import('../../api/engine/shared/scope')).getFromScope;

export type AccessorNode = {
  parseType: 'accessor' | 'symbol';
  path?: string[];
  name: string;
  isUndefined?: true,
}

type AccessorFactory = ParseNodeFactory<AccessorNode> & {
  compile: ResolveLevelFunction<AccessorNode>;
  reduce: ResolveLevelFunction<AccessorNode>;
}

type ValueType = undefined | Record<string, unknown> | number | string | boolean | unknown[];

const accessor: AccessorFactory = {
  create({
    name, path, isUndefined
  }: {
    name: string, path?: string[], isUndefined?: true
  }): AccessorNode {
    return {
      parseType: 'accessor',
      name,
      ...path && { path },
      ...isUndefined && { isUndefined: true },
    };
  },
  async compile(node, scope, context) {
    // Get the value from the given path
    let value: ValueType = await getFromScope(node.name, scope);
    node.path?.forEach(name => {
      if (name === 'isUndefined') {
        value = value === undefined;
        return;
      }
      if (value === undefined || value === null) {
        return;
      }
      value = (value as Record<string, unknown>)[name] as ValueType;
    });
    // If the accessor returns an object, get the object's value instead
    while (value && typeof value === 'object' && !Array.isArray(value)) {
      // Prefer the valueNode over the value
      if (value.valueNode) {
        value = value.valueNode as ValueType;
      } else if (value.valueNode) {
        value = value.value as ValueType;
      } else {
        break;
      }
    }
    // Return a discovered parse node
    if (isParseNode(value)) {
      return {
        result: value,
        context,
      };
    }
    // Return a parse node based on the constant type returned
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return {
        result: constant.create({ value }),
        context,
      };
    }
    // Return a parser array
    if (Array.isArray(value)) {
      // If the first value is a parse node, assume all the values are
      if (isParseNode(value[0])) {
        return {
          result: array.create({
            values: value as ParseNode[],
          }),
          context,
        };
      }
      // Create the array from js primitives instead
      return {
        result: array.fromConstantArray(value as number[]),
        context,
      };
    }
    if (typeof value === 'undefined') {
      // Replace unknown variables with zero marked isUndefined
      return {
        result: constant.create({
          value: 0,
          isUndefined: true,
        }),
        context
      };
    }
    // The type being accessed isn't supported above, make an error and return a copy of the node
    context.error(`Accessing ${accessor.toString(node, () => '')} is not supported yet`);
    return {
      result: accessor.create({
        name: node.name,
        path: node.path,
      }),
      context,
    };
  },
  async reduce(node, scope, context, inputProvider, resolveOthers): Promise<ResolvedResult> {
    // First compile the accessor
    const { result } = await accessor.compile(node, scope, context, inputProvider, resolveOthers);
    // If compilation didn't find a suitable replacement, return 0
    if (result.parseType === 'accessor' && result.isUndefined) {
      return {
        result: constant.create({
          value: 0,
          isUndefined: true,
        }),
        context
      };
    }
    return { result, context };
  },
  toString(node) {
    if (!node.path?.length) return `${node.name}`;
    return `${node.name}.${node.path.join('.')}`;
  },
  traverse(node, fn) {
    return fn(node);
  },
  map(node, fn) {
    return fn(node);
  }
}

function isParseNode(val: unknown): val is ParseNode {
  return !!val && typeof val === 'object' && 'parseType' in val && typeof val.parseType === 'string' && !!val.parseType
}

export default accessor;
