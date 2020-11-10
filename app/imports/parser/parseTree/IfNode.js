import ParseNode from '/imports/parser/parseTree/ParseNode.js';
import ConstantNode from '/imports/parser/parseTree/ConstantNode.js';

export default class IfNode extends ParseNode {
  constructor({condition, consequent, alternative}){
		super(...arguments);
    this.condition = condition;
    this.consequent = consequent;
    this.alternative = alternative;
  }
  toString(){
    let {condition, consequent, alternative} = this;
    return `${condition.toString()} ? ${consequent.toString()} : ${alternative.toString()}`
  }
  resolve(fn, scope, context){
    let condition = this.condition[fn](scope, context);
    if (condition instanceof ConstantNode){
      if (condition.value){
        return this.consequent[fn](scope, context);
      } else {
        return this.alternative[fn](scope, context);
      }
    } else {
      return new IfNode({
        condition: condition,
        consequent: this.consequent,
        alternative: this.alternative,
      });
    }
  }
  traverse(fn){
    fn(this);
    this.condition.traverse(fn);
    this.consequent.traverse(fn);
    this.alternative.traverse(fn);
  }
}
