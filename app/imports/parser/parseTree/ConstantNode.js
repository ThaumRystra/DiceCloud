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
  toString(){
    return `${this.value}`;
  }
  get isNumber(){
    return this.type === 'number';
  }
  get isInteger(){
    return this.isNumberNode && Number.isInteger(this.value);
  }
}
