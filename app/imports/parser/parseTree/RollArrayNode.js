import ParseNode from '/imports/parser/parseTree/ParseNode.js';
import ConstantNode from '/imports/parser/parseTree/ConstantNode.js';

export default class RollArrayNode extends ParseNode {
  constructor({values}) {
		super(...arguments);
    this.values = values;
  }
  compile(){
    return this;
  }
  toString(){
    return `[${this.values.join(', ')}]`;
  }
  reduce(){
    let total = this.values.reduce((a, b) => a + b);
    return new ConstantNode({
      value: total,
      type: 'number',
      previousNodes: [this],
    });
  }
}
