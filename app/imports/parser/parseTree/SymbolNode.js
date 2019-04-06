import ParseNode from '/imports/parser/parseTree/ParseNode.js';
import ConstantNode from '/imports/parser/parseTree/ConstantNode.js';

export default class SymbolNode extends ParseNode {
  constructor({name}){
		super();
    this.name = name;
  }
  compile(scope){
    let value = scope && scope[this.name];
    let type = typeof value;
    if (type === 'string' || type === 'number' || type === 'boolean'){
      return new ConstantNode({value, type});
    } else if (type === 'undefined'){
      return new ConstantNode({
        value: this.name,
        type: 'uncompiledNode',
        errors: [`${this.name} could not be resolved`]
      });
    } else {
      throw new Meteor.Error(`Unexpected case: ${this.name} resolved to ${value}`);
    }
  }
}
