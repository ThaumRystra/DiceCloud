import ParseNode from '/imports/parser/parseTree/ParseNode.js';

export default class RollArrayNode extends ParseNode {
  constructor({values}) {
		super();
    this.values = values;
  }
  compile(){
    return this;
  }
  toString(){
    return `[${this.values.join(', ')}]`;
  }
  reduce(){
    //TODO sum and return values
  }
}
