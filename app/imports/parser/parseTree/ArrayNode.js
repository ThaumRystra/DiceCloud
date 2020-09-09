import ParseNode from '/imports/parser/parseTree/ParseNode.js';

export default class ArrayNode extends ParseNode {
  constructor({values}) {
    super(...arguments);
    this.values = values;
  }
  compile(scope){
    let values = this.values.map(node => node.compile(scope));
    return new ArrayNode({values, previousNodes: [this]});
  }
  toString(){
    return `[${this.values.map(node => node.toString()).join(', ')}]`;
  }
}
