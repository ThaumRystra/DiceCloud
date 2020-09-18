import ParseNode from '/imports/parser/parseTree/ParseNode.js';

export default class ParenthesisNode extends ParseNode {
  constructor({content}) {
		super(...arguments);
    this.content = content;
  }
  resolve(fn, scope){
    let content = this.content[fn](scope);
    if (
      content.constructor.name === 'IfNode' ||
      content.constructor.name === 'OperatorNode'
    ){
      return new ParenthesisNode({content, previousNodes: [this]});
    } else {
      return content;
    }
  }
  toString(){
    return `(${this.content.toString()})`;
  }
}
