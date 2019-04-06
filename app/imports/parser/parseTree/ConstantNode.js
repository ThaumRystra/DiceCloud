import ParseNode from '/imports/parser/parseTree/ParseNode.js';

export default class ConstantNode extends ParseNode {
  constructor({value, type, errors}){
		super();
    // string, number, boolean, numberArray, uncompiledNode
    this.type = type;
    this.value = value;
    if (errors) this.errors = errors;
  }
  compile(){
    return this;
  }
  reduce(){
    if (this.type === 'numberArray'){
	    return this.value.reduce((total, num) => total + num, 0);
		} else {
			return this;
		}
  }
}
