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
    if (condition.value){
      let consequent = this.consequent[fn](scope);
      consequent.inheritDetails([condition, this]);
      return this.consequent[fn](scope);
    } else {
      let alternative = this.alternative[fn](scope);
      alternative.inheritDetails([condition, this]);
      return alternative;
    }
  }
}
