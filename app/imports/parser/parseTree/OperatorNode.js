import ParseNode from '/imports/parser/parseTree/ParseNode.js';
import ConstantNode from '/imports/parser/parseTree/ConstantNode.js';

export default class OperatorNode extends ParseNode {
  constructor({left, right, operator, fn}) {
		super();
    this.left = left;
    this.right = right;
    this.fn = fn;
    this.operator = operator;
  }
  compile(){
    let leftNode = this.left.compile();
    let rightNode = this.right.compile();
    let left, right;
    if (leftNode.type !== 'number' || rightNode.type !== 'number'){
      return new OperatorNode({
        left: leftNode,
        right: rightNode,
        operator: this.operator,
        fn: this.fn
      });
    } else {
      left = leftNode.value;
      right = rightNode.value;
    }
    let result;
    switch(this.operator){
      case '+': result = left + right; break;
      case '-': result = left - right; break;
      case '*': result = left * right; break;
      case '/': result = left / right; break;
      case '^': result = Math.pow(left, right); break;
      case '&':
      case '&&': result = left && right; break;
      case '|':
      case '||': result = left || right; break;
      case '=':
      case '==':
      case '===': result = left == right; break;
      case '!=':
      case '>': result = left > right; break;
      case '<': result = left < right; break;
      case '>=': result = left >= right; break;
      case '<=': result = left <= right; break;
    }
    return new ConstantNode({value: result, type: typeof result});
  }
  toString(){
    let {left, right, operator} = this;
    return `${left.toString()} ${operator} ${right.toString()}`;
  }
}
