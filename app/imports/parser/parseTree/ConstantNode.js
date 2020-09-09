import ParseNode from '/imports/parser/parseTree/ParseNode.js';

export default class ConstantNode extends ParseNode {
  constructor({value, type, rollTable}){
		super(...arguments);
    // string, number, boolean, numberArray, uncompiledNode
    this.type = type;
    this.value = value;
    if (rollTable) this.rollTable = rollTable;
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
    return this.type === 'number' && Number.isInteger(this.value);
  }
}
