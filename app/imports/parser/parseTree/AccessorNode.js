import ParseNode from '/imports/parser/parseTree/ParseNode.js';
import ErrorNode from '/imports/parser/parseTree/ErrorNode.js';
import ConstantNode from '/imports/parser/parseTree/ConstantNode.js';

export default class AccessorNode extends ParseNode {
  constructor({name, path}) {
    super(...arguments);
    this.name = name;
    this.path = path;
  }
  compile(scope){
    let value = scope && scope[this.name];
    // For objects, get their value
    this.path.forEach(name => {
      if (value === undefined) return;
      value = value[name];
    });
    let type = typeof value;
    if (type === 'string' || type === 'number' || type === 'boolean'){
      return new ConstantNode({value, type, previousNodes: [this]});
    } else if (type === 'undefined'){
      return new AccessorNode({
        name: this.name,
        path: this.path,
        previousNodes: [this],
      });
    } else {
      throw new Meteor.Error(`Unexpected case: ${this.name} resolved to ${value}`);
    }
  }
  reduce(scope){
    let result = this.compile(scope);
    if (result instanceof AccessorNode){
      return new ErrorNode({
        node: result,
        error: `${this.toString()} could not be resolved`,
        previousNodes: [result],
      });
    } else {
      return result;
    }
  }
  toString(){
    return `${this.name}.${this.path.join('.')}`;
  }
}
