import constant from '/imports/parser/parseTree/constant';
import array from '/imports/parser/parseTree/array';
import ResolvedResult from '/imports/parser/types/ResolvedResult';
import { getFromScope } from '/imports/api/creature/creatures/CreatureVariables';
import ResolveLevelFunction from '/imports/parser/types/ResolveLevelFunction';

export type AccessorNode = {
  parseType: 'accessor' | 'symbol';
  path?: string[];
  name: string;
}

type AccessorFactory = {
  create(node: Partial<AccessorNode>): AccessorNode;
  compile: ResolveLevelFunction<AccessorNode>;
  reduce: ResolveLevelFunction<AccessorNode>;
  toString(node: AccessorNode): string;
}

const accessor: AccessorFactory = {
  create({ name, path }: { name: string, path?: string[] }): AccessorNode {
    return {
      parseType: 'accessor',
      path,
      name,
    };
  },
  async compile(node, scope, context) {
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
  async reduce(node, scope, context, inputProvider, resolveOthers): Promise<ResolvedResult> {
    let { result } = await accessor.compile(node, scope, context, inputProvider, resolveOthers);
    ({ result } = await resolveOthers('reduce', result, scope, context, inputProvider));
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
