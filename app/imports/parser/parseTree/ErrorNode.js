import ParseNode from '/imports/parser/parseTree/ParseNode.js';

export default class ErrorNode extends ParseNode {
  constructor({node, error}) {
		super(...arguments);
    this.node = node;
    this.error = error;
  }
  compile(){
    return this;
  }
  toString(){
    return '###';
  }
}
