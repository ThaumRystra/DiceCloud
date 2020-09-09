import ParseNode from '/imports/parser/parseTree/ParseNode.js';
import ErrorNode from '/imports/parser/parseTree/ErrorNode.js';
import ConstantNode from '/imports/parser/parseTree/ConstantNode.js';

export default class CallNode extends ParseNode {
  constructor({functionName, args}) {
    super(...arguments);
    this.functionName = functionName;
    this.args = args;
  }
  compile(scope){
    return this.resolve('compile', scope);
  }
  roll(scope){
    return this.resolve('roll', scope);
  }
  reduce(scope){
    return this.resolve('reduce', scope);
  }
  resolve(fn, scope){
    let func = functions[this.functionName];
    if (!func) return new ErrorNode({
      node: this,
      error: `${this.functionName} is not a function`,
      previousNodes: [this],
    });
    let args = castArgsToType({fn, scope, args: this.args, type: func.argumentType});
    if (args.failed){
      if (fn === 'reduce'){
        return new ErrorNode({
          node: this,
          error: 'Could not convert all arguments to the correct type',
          previousNodes: [this],
        });
      } else {
        return new CallNode({
          functionName: this.functionName,
          args: args,
          previousNodes: [this],
        });
      }
    } else {
      let value = func.fn.apply(null, args);
      console.log({args})
      return new ConstantNode({
        value,
        type: 'number',
        previousNodes: [this],
      });
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
