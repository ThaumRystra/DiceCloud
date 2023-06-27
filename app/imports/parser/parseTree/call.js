import error from './error.js';
import constant from './constant.js';
import functions from '/imports/parser/functions.js';
import resolve, { toString, traverse, map } from '../resolve.js';

const call = {
  create({ functionName, args }) {
    return {
      parseType: 'call',
      functionName,
      args,
    }
  },
  resolve(fn, node, scope, context) {
    let func = functions[node.functionName];
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
    const resolveToLevel = (node, maxResolveFn = 'reduce') => {
      // Determine the actual depth to resolve to
      let resolveFn = 'reduce';
      if (fn === 'compile' || maxResolveFn === 'compile') {
        resolveFn = 'compile';
      } else if (fn === 'roll' || maxResolveFn === 'roll') {
        resolveFn = 'roll';
      }
      // Resolve
      return resolve(resolveFn, node, scope, context);
    }

    // Resolve the arguments
    let resolvedArgs = node.args.map((arg, i) => {
      let { result } = resolveToLevel(arg, func.maxResolveLevels?.[i]);
      return result;
    });

    // Check that the arguments match what is expected
    let checkFailed = call.checkArugments({
      node,
      fn,
      resolvedArgs,
      func,
      context,
    });

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

    // Map contant nodes to constants before attempting to run the function
    let mappedArgs = resolvedArgs.map((arg, index) => {
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
      let value = func.fn.apply({
        scope,
        context,
      }, mappedArgs);

      let valueType = typeof value;
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
    } catch (error) {
      context.error(error.message || error);
      return {
        result: error.create({
          node: node,
          error: error.message || error,
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
  checkArugments({ node, fn, func, resolvedArgs, context }) {
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
      let type;
      if (argumentsExpected.anyLength) {
        type = argumentsExpected[0];
      } else {
        type = argumentsExpected[index];
      }
      if (type === 'parseNode') return;
      if (node.parseType !== type && node.valueType !== type) failed = true;
      if (failed && fn === 'reduce') {
        let typeName = typeof type === 'string' ? type : type.constructor.name;
        let nodeName = node.parseType;
        context.error(`Incorrect arguments to ${node.functionName} function` +
          `expected ${typeName} got ${nodeName}`);
      }
    });
    return failed;
  }
}

export default call;
