import constant from '/imports/parser/parseTree/constant';
import array from '/imports/parser/parseTree/array';
import ResolvedResult from '/imports/parser/types/ResolvedResult';
import { getFromScope } from '/imports/api/creature/creatures/CreatureVariables';
import ResolveLevelFunction from '/imports/parser/types/ResolveLevelFunction';

export type AccessorNode = {
  parseType: 'accessor' | 'symbol';
  path?: string[];
  name: string;
  isUndefined?: true,
}

type AccessorFactory = {
  create(node: Partial<AccessorNode>): AccessorNode;
  compile: ResolveLevelFunction<AccessorNode>;
  reduce: ResolveLevelFunction<AccessorNode>;
  toString(node: AccessorNode): string;
}

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
    let value = getFromScope(node.name, scope);
    // Get the value from the given path
    node.path?.forEach(name => {
      if (name === 'isUndefined') {
        value = value === undefined;
        return;
      }
      if (value === undefined) {
        return;
      }
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
      // Replace unknown variables with zero marked isUndefined
      return {
        result: constant.create({
          value: 0,
          isUndefined: true,
        }),
        context
      };
      // Old Behavior
      // We are only at compile, if it isn't defined in the scope, return a copy of the accessor
      return {
        result: accessor.create({
          name: node.name,
          path: node.path,
          isUndefined: true,
        }),
        context,
      };
    }
    // The type being accessed isn't supported above, make an error and return a copy of the node
    context.error(`Accessing ${accessor.toString(node)} is not supported yet`);
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
  }
}

function getType(val) {
  if (!val) return typeof val;
  if (Array.isArray(val)) return 'array';
  if (val.parseType) return 'parseNode';
  return typeof val;
}

export default accessor;
