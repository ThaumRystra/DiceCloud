import error from './error';
import constant from './constant';
import functions, { ParserFunction } from '/imports/parser/functions';
import resolve, { toString, traverse, map, Context, ResolvedResult } from '/imports/parser/resolve';
import ParseNode from '/imports/parser/parseTree/ParseNode';
import NodeFactory, { ResolveLevel } from '/imports/parser/parseTree/NodeFactory';

export type CallNode = {
  parseType: 'call';
  functionName: string;
  args: ParseNode[];
}

interface CallFactory extends NodeFactory {
  create(node: Partial<CallNode>): CallNode;
  resolve(
    fn: ResolveLevel, node: CallNode, scope: Record<string, any>, context: Context
  ): ResolvedResult;
  toString(node: CallNode): string;
  traverse(node: CallNode, fn: (node: ParseNode) => any): ReturnType<typeof fn>;
  map(node: CallNode, fn: (node: ParseNode) => any): ReturnType<typeof fn>;
  checkArguments(node: CallNode, fn: ResolveLevel, func: ParserFunction,
    resolvedArgs: ParseNode[], context: Context): boolean;
}

const call: CallFactory = {
  create({ functionName, args = [] }: { functionName: string, args: ParseNode[] }): CallNode {
    return {
      parseType: 'call',
      functionName,
      args,
    }
  },
  resolve(fn, node, scope, context): ResolvedResult {
    const func = functions[node.functionName];
    // Check that the function exists
    if (!func) {
      context.error(`${node.functionName} is not a supported function`);
      return {
        result: error.create({
          node: node,
          error: `${node.functionName} is not a supported function`,
        }),
        context,
      };
    }

    // Resolve a given node to a maximum depth of resolution
    const resolveToLevel = (node, maxResolveFn = 'reduce'): ResolvedResult => {
      // Determine the actual depth to resolve to
      let resolveFn: ResolveLevel = 'reduce';
      if (fn === 'compile' || maxResolveFn === 'compile') {
        resolveFn = 'compile';
      } else if (fn === 'roll' || maxResolveFn === 'roll') {
        resolveFn = 'roll';
      }
      // Resolve
      return resolve(resolveFn, node, scope, context);
    }

    // Resolve the arguments
    const resolvedArgs = node.args.map((arg, i) => {
      const { result } = resolveToLevel(arg, func.maxResolveLevels?.[i]);
      return result;
    });

    // Check that the arguments match what is expected
    const checkFailed = call.checkArguments(node, fn, func, resolvedArgs, context);

    if (checkFailed) {
      if (fn === 'reduce') {
        context.error(`Invalid arguments to ${node.functionName} function`);
        return {
          result: error.create({
            node: node,
            error: `Invalid arguments to ${node.functionName} function`,
          }),
          context,
        };
      } else {
        return {
          result: call.create({
            functionName: node.functionName,
            args: resolvedArgs,
          }),
          context,
        };
      }
    }

    // Map constant nodes to constants before attempting to run the function
    const mappedArgs = resolvedArgs.map((arg, index) => {
      if (
        arg.parseType === 'constant' &&
        func.arguments[index] !== 'parseNode'
      ) {
        return arg.value;
      } else {
        return arg;
      }
    });

    try {
      // Run the function
      const value = func.fn.apply({
        scope,
        context,
      }, mappedArgs);

      const valueType = typeof value;
      if (valueType === 'number' || valueType === 'string' || valueType === 'boolean') {
        // Convert constant results into constant nodes
        return {
          result: constant.create({ value }),
          context,
        };
      } else {
        // Resolve the return value
        return resolve(fn, value, scope, context);
      }
    } catch (err) {
      context.error(`Internal error: ${err.message || err}`);
      return {
        result: error.create({
          node: node,
          error: `Internal error: ${err.message || err}`,
        }),
        context,
      }
    }
  },
  toString(node) {
    return `${node.functionName}(${node.args.map(arg => toString(arg)).join(', ')})`;
  },
  traverse(node, fn) {
    fn(node);
    node.args.forEach(arg => traverse(arg, fn));
  },
  map(node, fn) {
    const resultingNode = fn(node);
    if (resultingNode === node) {
      node.args = node.args.map(arg => map(arg, fn));
    }
    return resultingNode;
  },
  checkArguments(node, fn, func, resolvedArgs, context) {
    const argumentsExpected = func.arguments;
    // Check that the number of arguments matches the number expected
    if (
      !argumentsExpected.anyLength &&
      resolvedArgs.length > (func.maxArguments ?? argumentsExpected.length) ||
      resolvedArgs.length < (func.minArguments ?? argumentsExpected.length)
    ) {
      context.error('Incorrect number of arguments ' +
        `to ${node.functionName} function, ` +
        `expected ${argumentsExpected.length} got ${resolvedArgs.length}`);
      return true;
    }

    let failed = false;
    // Check that each argument is of the correct type
    resolvedArgs.forEach((node, index) => {
      let type: string;
      if (argumentsExpected.anyLength) {
        type = argumentsExpected[0];
      } else {
        type = argumentsExpected[index];
      }
      if (type === 'parseNode') return;
      if (node.parseType !== type && node.valueType !== type) failed = true;
      if (failed && fn === 'reduce') {
        const typeName = typeof type === 'string' ? type : type.constructor.name;
        const nodeName = node.parseType;
        context.error(`Incorrect arguments to ${node.functionName} function` +
          `expected ${typeName} got ${nodeName}`);
      }
    });
    return failed;
  }
}

export default call;
