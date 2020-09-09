import ParseNode from '/imports/parser/parseTree/ParseNode.js';

export default class ArrayNode extends ParseNode {
  constructor({values}) {
		super();
    this.values = values;
  }
  compile(){
    let values = this.values.map(node => node.compile());
    return new ArrayNode({values});
  }
  toString(){
    return `[${this.values.map(node => node.toString()).join(', ')}]`;
  }
}
