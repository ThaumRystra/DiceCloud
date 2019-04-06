import ParseNode from '/imports/parser/parseTree/ParseNode.js';
import ConstantNode from '/imports/parser/parseTree/ConstantNode.js';

export default class IfNode extends ParseNode {
  constructor({condition, consequent, alternative}){
		super();
    this.condition = condition;
    this.consequent = consequent;
    this.alternative = alternative;
  }
  compile(){
    let condition = this.condition.compile();
    let consequent = this.consequent.compile();
    let alternative = this.alternative.compile();
    if (
      condition.type !== 'string' &&
			condition.type !== 'number' &&
			condition.type !== 'boolean'
    ){
      // Handle unresolved condition
      return new ConstantNode({
        value: `if (${condition.value}) ${consequent.value} else ${alternative.value}`,
        type: 'uncompiledNode',
        errors: [
          ...condition.errors,
          ...consequent.errors,
          ...alternative.errors,
        ],
      });
    } else {
			// So long as the condition reolves, return the correct alternative,
			// even if it's unresolved
      if (condition.value){
        return consequent;
      } else {
        return alternative;
      }
    }
  }
}
