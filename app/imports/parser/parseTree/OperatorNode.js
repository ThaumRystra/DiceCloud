import ParseNode from '/imports/parser/parseTree/ParseNode.js';
import ConstantNode from '/imports/parser/parseTree/ConstantNode.js';

export default class OperatorNode extends ParseNode {
  constructor({left, right, operator, fn}) {
		super(...arguments);
    this.left = left;
    this.right = right;
    this.fn = fn;
    this.operator = operator;
  }
  resolve(fn, scope, context){
    let leftNode = this.left[fn](scope, context);
    let rightNode = this.right[fn](scope, context);
    let left, right;
    if (!(leftNode instanceof ConstantNode) || !(rightNode instanceof ConstantNode)){
      return new OperatorNode({
        left: leftNode,
        right: rightNode,
        operator: this.operator,
        fn: this.fn,
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
      case '%': result = left % right; break;
      case '&':
      case '&&': result = left && right; break;
      case '|':
      case '||': result = left || right; break;
      case '=':
      case '==':  result = left == right; break;
      case '===': result = left === right; break;
      case '!=':  result = left != right; break;
      case '!==': result = left !== right; break;
      case '>': result = left > right; break;
      case '<': result = left < right; break;
      case '>=': result = left >= right; break;
      case '<=': result = left <= right; break;
    }
    return new ConstantNode({
      value: result,
      type: typeof result,
    });
  }
  toString(){
    let {left, right, operator} = this;
    // special case of adding a negative number
    if (operator === '+' && right.isNumber && right.value < 0){
      return `${left.toString()} - ${-right.value}`
    }
    return `${left.toString()} ${operator} ${right.toString()}`;
  }
  traverse(fn){
    fn(this);
    this.left.traverse(fn);
    this.right.traverse(fn);
  }
  replaceChildren(fn){
    this.left = this.left.replaceNodes(fn);
    this.right = this.right.replaceNodes(fn);
  }
}
