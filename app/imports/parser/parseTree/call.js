import error from './error.js';
import constant from './constant.js';
import functions from '/imports/parser/functions.js';
import resolve, { toString, traverse, mergeResolvedNodes } from '../resolve.js';

const call = {
  create({functionName, args}) {
    return {
      type: 'call',
      functionName,
      args,
    }
  },
  resolve(fn, node, scope, context){
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

    // Resolve the arguments
    let resolvedArgs = node.args.map(arg => {
      let { result } = resolve(fn, arg, scope, context);
      return result;
    });

    // Check that the arguments match what is expected
    let checkFailed = call.checkArugments({
      fn,
      resolvedArgs,
      argumentsExpected: func.arguments,
      context,
    });

    if (checkFailed){
      if (fn === 'reduce'){
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
    let mappedArgs = resolvedArgs.map(arg => {
      if (arg.type === 'constant'){
        return arg.value;
      } else {
        return arg;
      }
    });

    try {
      // Run the function
      let value = func.fn.apply(null, mappedArgs);

      let valueType = typeof value;
      if (valueType === 'number' || valueType === 'string' || valueType === 'boolean'){
        // Convert constant results into constant nodes
        return {
          result: constant.create({ value, valueType }),
          context,
        };
      } else {
        return {
          result: value,
          context,
        };
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
  toString(node){
    return `${node.functionName}(${node.args.map(arg => toString(arg)).join(', ')})`;
  },
  traverse(node, fn){
    fn(node);
    node.args.forEach(arg => traverse(arg, fn));
  },
  checkArugments({node, fn, argumentsExpected, resolvedArgs, context}){
    // Check that the number of arguments matches the number expected
    if (
      !argumentsExpected.anyLength &&
      argumentsExpected.length !== resolvedArgs.length
    ){
      context.error('Incorrect number of arguments ' +
        `to ${node.functionName} function, ` +
        `expected ${argumentsExpected.length} got ${resolvedArgs.length}`);
      return true;
    }

    let failed = false;
    // Check that each argument is of the correct type
    resolvedArgs.forEach((node, index) => {
      let type;
      if (argumentsExpected.anyLength){
        type = argumentsExpected[0];
      } else {
        type = argumentsExpected[index];
      }
      if (typeof type === 'string'){
        // Type being a string means a constant node with matching type
        if (node.valueType !== type) failed = true;
      } else {
        // Otherwise check that the node is an instance of the given type
        if (!(node instanceof type)) failed = true;
      }
      if (failed && fn === 'reduce'){
        let typeName = typeof type === 'string' ? type : type.constructor.name;
        let nodeName = node.type;
        context.error(`Incorrect arguments to ${node.functionName} function` +
          `expected ${typeName} got ${nodeName}`);
      }
    });
    return failed;
  }
}

export default call;
