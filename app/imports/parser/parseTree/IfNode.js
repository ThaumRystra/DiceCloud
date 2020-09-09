import ParseNode from '/imports/parser/parseTree/ParseNode.js';

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
    let condition = this.condition[fn](scope);
    let consequent = this.consequent[fn](scope);
    let alternative = this.alternative[fn](scope);
    this.resolve(condition, consequent, alternative);
    if (condition.value){
      consequent.inheritDetails([condition, this]);
      return consequent;
    } else {
      alternative.inheritDetails([condition, this]);
      return alternative;
    }
  }
}
