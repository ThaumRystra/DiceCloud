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
  resolve(fn, scope){
    let condition = this.condition[fn](scope);
    if (condition instanceof ConstantNode){
      if (condition.value){
        let consequent = this.consequent[fn](scope);
        consequent.inheritDetails([condition, this]);
        return this.consequent[fn](scope);
      } else {
        let alternative = this.alternative[fn](scope);
        alternative.inheritDetails([condition, this]);
        return alternative;
      }
    } else {
      return new IfNode({
        condition: condition,
        consequent: this.consequent,
        alternative: this.alternative,
      });
    }
  }
}
