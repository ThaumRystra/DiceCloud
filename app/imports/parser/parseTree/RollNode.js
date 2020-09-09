import ParseNode from '/imports/parser/parseTree/ParseNode.js';
import ArrayNode from '/imports/parser/parseTree/ArrayNode.js';
import ErrorNode from '/imports/parser/parseTree/ErrorNode.js';

export default class RollNode extends ParseNode {
  constructor({left, right}) {
		super();
    this.left = left;
    this.right = right;
  }
  compile(){
    let left = this.left.compile();
    let right = this.right.compile();
    return new RollNode({left, right});
  }
  toString(){
    if (
      this.left.isNumberNode && this.left.value === 1
    ){
      return `d${this.right.toString()}`;
    } else {
      return `${this.left.toString()}d${this.right.toString()}`;
    }
  }
  roll(){
    let left = this.left.reduce();
    let right = this.right.reduce();
    if (!left.isInteger){
      return new ErrorNode({
        node: this,
        error: 'Number of dice is not an integer'
      });
    }
    if (!right.isInteger){
      return new ErrorNode({
        node: this,
        error: 'Dice size is not an integer'
      });
    }
    let number = left.value;
    if (number > 100) return new ErrorNode({
      node: this,
      error: 'Can\'t roll more than 100 dice at once'
    });
    let diceSize = right.value;
    let randomSrc = DDP.randomStream('diceRoller');
    let rolls = [];
    for (let i = 0; i < number; i++){
      let roll = ~~(randomSrc.fraction() * diceSize) + 1
      rolls.push(roll);
    }
    return new ArrayNode({values: rolls});
  }
  reduce(){
    this.roll().reduce();
  }
}
