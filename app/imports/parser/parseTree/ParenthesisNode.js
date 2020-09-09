import ParseNode from '/imports/parser/parseTree/ParseNode.js';

export default class ParenthesisNode extends ParseNode {
  constructor({content}) {
		super();
    this.content = content;
  }
  compile(){
    let content = this.content.compile();
    if (content.constructor.name === 'ConstantNode'){
      return content;
    } else {
      return new ParenthesisNode({content});
    }
  }
  toString(){
    return `(${this.content.toString()})`;
  }
}
