import ParseNode from '/imports/parser/parseTree/ParseNode.js';
import ConstantNode from '/imports/parser/parseTree/ConstantNode.js';

export default class UnaryOperatorNode extends ParseNode {
  constructor({operator, right}) {
		super(...arguments);
    this.operator = operator;
    this.right = right;
  }
  resolve(fn, scope, context){
    let rightNode = this.right[fn](scope, context);
    if (rightNode.type !== 'number'){
      return new UnaryOperatorNode({
        operator: this.operator,
        right: rightNode,
      });
    }
    let right = rightNode.value;
    let result;
    switch(this.operator){
      case '-': result = -right; break;
      case '+': result = +right; break;
    }
    return new ConstantNode({
      value: result,
      type: typeof result,
    });
  }
  toString(){
    let {right, operator} = this;
    return `${operator}${right.toString()}`;
  }
  traverse(fn){
    fn(this);
    this.right.traverse(fn);
  }
  replaceChildren(fn){
    this.right = this.right.replaceNodes(fn);
  }
}
