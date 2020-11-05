import ParseNode from '/imports/parser/parseTree/ParseNode.js';
import ConstantNode from '/imports/parser/parseTree/ConstantNode.js';

export default class NotOperatorNode extends ParseNode {
  constructor({right}) {
		super(...arguments);
    this.right = right;
  }
  resolve(fn, scope, context){
    let rightNode = this.right[fn](scope, context);
    if (!(rightNode instanceof ConstantNode)){
      return new NotOperatorNode({
        right: rightNode,
      });
    }
    let right = rightNode.value;
    let result = !right;
    return new ConstantNode({
      value: result,
      type: typeof result,
    });
  }
  toString(){
    let {right} = this;
    return `!${right.toString()}`;
  }
}
