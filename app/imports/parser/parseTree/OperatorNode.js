import ParseNode from '/imports/parser/parseTree/ParseNode.js';

export default class OperatorNode extends ParseNode {
  constructor({left, right, operator, fn}) {
		super();
    this.left = left;
    this.right = right;
    this.fn = fn;
    this.operator = operator;
  }
}
