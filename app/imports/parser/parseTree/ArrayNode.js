import ParseNode from '/imports/parser/parseTree/ParseNode.js';
import ConstantNode from '/imports/parser/parseTree/ConstantNode.js';

export default class ArrayNode extends ParseNode {
  constructor({values}) {
    super(...arguments);
    this.values = values;
  }
  static fromConstantArray(array){
    let values = array.map( value => {
      let type = typeof value;
      if (
        type === 'string' ||
        type === 'number' ||
        type === 'boolean' ||
        type === 'undefined'
      ){
        return new ConstantNode({value, type});
      } else {
        throw `Unexpected type in constant array: ${type}`
      }
    });
    return new ArrayNode({values});
  }
  resolve(fn, scope, context){
    let values = this.values.map(node => node[fn](scope, context));
    return new ArrayNode({values});
  }
  toString(){
    return `[${this.values.map(node => node.toString()).join(', ')}]`;
  }
  traverse(fn){
    fn(this);
    this.values.forEach(value => value.traverse(fn));
  }
}
