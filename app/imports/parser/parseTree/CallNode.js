import ParseNode from '/imports/parser/parseTree/ParseNode.js';
import ErrorNode from '/imports/parser/parseTree/ErrorNode.js';
import ConstantNode from '/imports/parser/parseTree/ConstantNode.js';
import functions from '/imports/parser/functions.js';

export default class CallNode extends ParseNode {
  constructor({functionName, args}) {
    super(...arguments);
    this.functionName = functionName;
    this.args = args;
  }
  resolve(fn, scope, context){
    let func = functions[this.functionName];
    // Check that the function exists
    if (!func) return new ErrorNode({
      node: this,
      error: `${this.functionName} is not a supported function`,
      context,
    });

    // Resolve the arguments
    let resolvedArgs = this.args.map(node => node[fn](scope, context));
    // Check that the arguments match what is expected
    let checkFailed = this.checkArugments({
      fn,
      context,
      resolvedArgs,
      argumentsExpected: func.arguments
    });

    if (checkFailed){
      if (fn === 'reduce'){
        return new ErrorNode({
          node: this,
          error: `Invalid arguments to ${this.functionName} function`,
        });
      } else {
        return new CallNode({
          functionName: this.functionName,
          args: resolvedArgs,
        });
      }
    }

    // Map contant nodes to constants before attempting to run the function
    let mappedArgs = resolvedArgs.map(node => {
      if (node instanceof ConstantNode){
        return node.value;
      } else {
        return node;
      }
    });

    try {
      // Run the function
      let value = func.fn.apply(null, mappedArgs);

      let type = typeof value;
      if (type === 'number' || type === 'string' || type === 'boolean'){
        // Convert constant results into constant nodes
        return new ConstantNode({ value, type });
      } else {
        return value;
      }
    } catch (error) {
      return new ErrorNode({
        node: this,
        error: error.message || error,
        context,
      });
    }
  }
  toString(){
    return `${this.functionName}(${this.args.map(node => node.toString()).join(', ')})`;
  }
  traverse(fn){
    fn(this);
    this.args.forEach(arg => arg.traverse(fn));
  }
  replaceChildren(fn){
    this.args = this.args.map(arg => arg.replaceNodes(fn));
  }
  checkArugments({fn, context, argumentsExpected, resolvedArgs}){
    // Check that the number of arguments matches the number expected
    if (
      !argumentsExpected.anyLength &&
      argumentsExpected.length !== resolvedArgs.length
    ){
      context.storeError({
        type: 'error',
        message: 'Incorrect number of arguments ' +
          `to ${this.functionName} function, ` +
          `expected ${argumentsExpected.length} got ${resolvedArgs.length}`
        });
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
        if (node.type !== type) failed = true;
      } else {
        // Otherwise check that the node is an instance of the given type
        if (!(node instanceof type)) failed = true;
      }
      if (failed && fn === 'reduce'){
        let typeName = typeof type === 'string' ? type : type.constructor.name;
        let nodeName = node.type || node.constructor.name
        context.storeError({
          type: 'error',
          message: `Incorrect arguments to ${this.functionName} function` +
          `expected ${typeName} got ${nodeName}`
        });
      }
    });
    return failed;
  }
}
