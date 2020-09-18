import ParseNode from '/imports/parser/parseTree/ParseNode.js';
import ErrorNode from '/imports/parser/parseTree/ErrorNode.js';
import ConstantNode from '/imports/parser/parseTree/ConstantNode.js';

export default class CallNode extends ParseNode {
  constructor({functionName, args}) {
    super(...arguments);
    this.functionName = functionName;
    this.args = args;
  }
  resolve(fn, scope, context){
    let func = functions[this.functionName];
    if (!func) return new ErrorNode({
      node: this,
      error: `${this.functionName} is not a function`,
      context,
    });
    let args = castArgsToType({fn, scope, args: this.args, type: func.argumentType});
    if (args.failed){
      if (fn === 'reduce'){
        return new ErrorNode({
          node: this,
          error: 'Could not convert all arguments to the correct type',
          context,
        });
      } else {
        return new CallNode({
          functionName: this.functionName,
          args: args,
        });
      }
    } else {
      try {
        let value = func.fn.apply(null, args);
        return new ConstantNode({
          value,
          type: 'number',
          previousNodes: [this],
        });
      } catch (error) {
        return new ErrorNode({
          node: this,
          error,
          context,
        });
      }
    }
  }
  toString(){
    return `${this.functionName}(${this.args.map(node => node.toString()).join(', ')})`;
  }
}

const functions = {
  'min': {
    comment: 'Returns the lowest of the given numbers',
    argumentType: 'number',
    resultType: 'number',
    fn: Math.min,
  },
}

function castArgsToType({fn, scope, args, type}){
  let resolvedArgs = args.map(node => node[fn](scope))
  let result = [];
  if (type === 'number'){
    resolvedArgs.forEach(node => {
      if (node.isNumber){
        result.push(node.value);
      } else {
        resolvedArgs.failed = true;
      }
    })
  }
  if (resolvedArgs.failed) return resolvedArgs;
  console.log({result})
  return result;
}
