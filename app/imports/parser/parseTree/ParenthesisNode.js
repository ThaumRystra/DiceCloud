import ParseNode from '/imports/parser/parseTree/ParseNode.js';

export default class ParenthesisNode extends ParseNode {
  constructor({content}) {
		super(...arguments);
    this.content = content;
  }
  resolve(fn, scope, context){
    let content = this.content[fn](scope, context);
    if (
      content.constructor.name === 'IfNode' ||
      content.constructor.name === 'OperatorNode' ||
      content.constructor.name === 'RollNode'
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
