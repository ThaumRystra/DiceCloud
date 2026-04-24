import type Context from '../types/Context';
import type { ResolvedResult } from '../types/ResolvedResult';
import { serialMap } from '/imports/api/utility/asyncMap';
import errorToString from '/imports/api/utility/errorToString';
import functions, { type ParserFunction } from '/imports/parser/functions';
import constant from '/imports/parser/parseTree/constant';
import error from '/imports/parser/parseTree/error';
import type { ParseNode } from '/imports/parser/parseTree/ParseNode';
import type { ParseNodeFactory } from '/imports/parser/types/ParseNodeFactory';
import type { ResolveFunction } from '/imports/parser/types/ResolveFunction';
import type { ResolveLevel } from '/imports/parser/types/ResolveLevel';

export type CallNode = {
  parseType: 'call';
  functionName: string;
  args: ParseNode[];
}

type CallFactory = ParseNodeFactory<CallNode> & {
  checkArguments(
    node: CallNode,
    fn: ResolveLevel,
    func: ParserFunction,
    resolvedArgs: ParseNode[],
    context: Context,
  ): boolean;
  resolve: ResolveFunction<CallNode>;
}

const call: CallFactory = {
  create({ functionName, args = [] }: { functionName: string, args: ParseNode[] }): CallNode {
    return {
      parseType: 'call',
      functionName,
      args,
    }
  },
  async resolve(fn, node, scope, context, inputProvider, resolveOthers): Promise<ResolvedResult> {
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
    const resolveToLevel = (node: ParseNode, maxResolveFn: ResolveLevel = 'reduce'): Promise<ResolvedResult> => {
      // Determine the actual depth to resolve to
      let resolveFn: ResolveLevel = 'reduce';
      if (fn === 'compile' || maxResolveFn === 'compile') {
        resolveFn = 'compile';
      } else if (fn === 'roll' || maxResolveFn === 'roll') {
        resolveFn = 'roll';
      }
      // Resolve
      return resolveOthers(resolveFn, node, scope, context, inputProvider);
    }

    // Resolve the arguments
    const resolvedArgs: ParseNode[] = [];
    for (const [i, arg] of node.args.entries()) {
      const { result } = await resolveToLevel(arg, func.maxResolveLevels?.[i]);
      resolvedArgs.push(result);
    }

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
      const value = await func.fn.apply({
        scope,
        context,
      }, mappedArgs);

      if (typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean') {
        // Convert constant results into constant nodes
        return {
          result: constant.create({ value }),
          context,
        };
      } else {
        // Resolve the return value
        return resolveOthers(fn, value as ParseNode, scope, context, inputProvider);
      }
    } catch (err) {
      const message = errorToString(err);
      context.error(`Internal error: ${message}`);
      return {
        result: error.create({
          node: node,
          error: `Internal error: ${message}`,
        }),
        context,
      }
    }
  },
  toString(node, toStringOthers) {
    return `${node.functionName}(${node.args.map(arg => toStringOthers(arg)).join(', ')})`;
  },
  traverse(node, fn, traverseOthers) {
    fn(node);
    node.args.forEach(arg => traverseOthers(arg, fn));
  },
  async map(node, fn, mapOthers) {
    const resultingNode = await fn(node);
    if (resultingNode === node) {
      node.args = await serialMap(node.args, async arg => mapOthers(arg, fn));
    }
    return resultingNode;
  },
  checkArguments(callNode, fn, func, resolvedArgs, context) {
    const argumentsExpected = func.arguments;
    // Check that the number of arguments matches the number expected
    if (
      !argumentsExpected.anyLength &&
      resolvedArgs.length > (func.maxArguments ?? argumentsExpected.length) ||
      resolvedArgs.length < (func.minArguments ?? argumentsExpected.length)
    ) {
      context.error('Incorrect number of arguments ' +
        `to ${callNode.functionName} function, ` +
        `expected ${argumentsExpected.length} got ${resolvedArgs.length}`);
      return true;
    }

    let failed = false;
    // Check that each argument is of the correct type
    resolvedArgs.forEach((node, index) => {
      let expectedType;
      if (argumentsExpected.anyLength) {
        expectedType = argumentsExpected[0];
      } else {
        expectedType = argumentsExpected[index];
      }
      if (expectedType === 'parseNode') return;
      const argFailed = !(
        node.parseType === expectedType
        || (node.parseType === 'constant' && node.valueType === expectedType)
      );
      if (argFailed && fn === 'reduce') {
        const nodeName = node.parseType === 'constant' ? node.valueType : node.parseType;
        context.error(`Incorrect arguments to ${callNode.functionName} function` +
          `expected ${expectedType} got ${nodeName}`);
      }
      failed = failed || argFailed;
    });
    return failed;
  }
}

export default call;
