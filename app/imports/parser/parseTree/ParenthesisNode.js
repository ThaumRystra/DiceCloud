import ParseNode from '/imports/parser/parseTree/ParseNode.js';

export default class ParenthesisNode extends ParseNode {
  constructor({content}) {
		super(...arguments);
    this.content = content;
  }
  resolve(fn, scope, context){
    let content = this.content[fn](scope, context);
    if (
      fn === 'reduce' ||
      content.constructor.name === 'ConstantNode' ||
      content.constructor.name === 'ErrorNode'
    ){
      return content;
    } else {
      return new ParenthesisNode({content});
    }
  }
  toString(){
    return `(${this.content.toString()})`;
  }
  traverse(fn){
    fn(this);
    this.content.traverse(fn);
  }
  replaceChildren(fn){
    this.content = this.content.replaceNodes(fn);
  }
}
