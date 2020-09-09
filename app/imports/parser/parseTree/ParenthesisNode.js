import ParseNode from '/imports/parser/parseTree/ParseNode.js';

export default class ParenthesisNode extends ParseNode {
  constructor({content}) {
		super(...arguments);
    this.content = content;
  }
  compile(scope){
    return this.resolve('compile', scope);
  }
  roll(scope){
    return this.resolve('roll', scope);
  }
  reduce(scope){
    return this.resolve('reduce', scope);
  }
  resolve(fn, scope){
    let content = this.content[fn](scope);
    if (content.constructor.name === 'ConstantNode'){
      return content;
    } else {
      return new ParenthesisNode({content, previousNodes: [this]});
    }
  }
  toString(){
    return `(${this.content.toString()})`;
  }
}
