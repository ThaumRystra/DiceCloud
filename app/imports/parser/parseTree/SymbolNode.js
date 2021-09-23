import ParseNode from '/imports/parser/parseTree/ParseNode.js';
import ConstantNode from '/imports/parser/parseTree/ConstantNode.js';

export default class SymbolNode extends ParseNode {
  constructor({name}){
		super(...arguments);
    this.name = name;
  }
  toString(){
    return `${this.name}`
  }
  compile(scope, context, calledFromReduce = false){
    let value = scope && scope[this.name];
    let type = typeof value;
    // For objects, default to their .value
    if (type === 'object'){
      value = value.value;
      type = typeof value;
    }
    // For parse nodes, compile and return
    if (value instanceof ParseNode){
      if (calledFromReduce){
        return value.reduce(scope, context);
      } else {
        return value.compile(scope, context);
      }
    }
    if (type === 'string' || type === 'number' || type === 'boolean'){
      return new ConstantNode({value, type});
    } else if (type === 'undefined'){
      return new SymbolNode({
        name: this.name,
      });
    } else {
      throw new Meteor.Error(`Unexpected case: ${this.name} resolved to ${value}`);
    }
  }
  reduce(scope, context){
    let result = this.compile(scope, context, true);
    if (result instanceof SymbolNode){
      if (context) context.storeError({
        type: 'info',
        message: `${result.toString()} not found, set to 0`
      });
      return new ConstantNode({
        type: 'number',
        value: 0,
      });
    } else {
      return result;
    }
  }
}
