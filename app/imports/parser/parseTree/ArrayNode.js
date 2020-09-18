import ParseNode from '/imports/parser/parseTree/ParseNode.js';

export default class ArrayNode extends ParseNode {
  constructor({values}) {
    super(...arguments);
    this.values = values;
  }
  resolve(fn, scope, context){
    let values = this.values.map(node => node[fn](scope, context));
    return new ArrayNode({values});
  }
  toString(){
    return `[${this.values.map(node => node.toString()).join(', ')}]`;
  }
}
