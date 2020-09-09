import ParseNode from '/imports/parser/parseTree/ParseNode.js';
import ConstantNode from '/imports/parser/parseTree/ConstantNode.js';
import ErrorNode from '/imports/parser/parseTree/ErrorNode.js';

export default class SymbolNode extends ParseNode {
  constructor({name}){
		super(...arguments);
    this.name = name;
  }
  toString(){
    return `${this.name}`
  }
  compile(scope){
    let value = scope && scope[this.name];
    let type = typeof value;
    if (type === 'string' || type === 'number' || type === 'boolean'){
      return new ConstantNode({value, type, previousNodes: [this]});
    } else if (type === 'undefined'){
      return new ErrorNode({
        node: this,
        error: `${this.name} could not be resolved`,
      });
    } else {
      throw new Meteor.Error(`Unexpected case: ${this.name} resolved to ${value}`);
    }
  }
}
