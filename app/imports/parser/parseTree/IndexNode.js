import ParseNode from '/imports/parser/parseTree/ParseNode.js';

export default class IndexNode extends ParseNode {
  constructor({array, index}) {
		super();
    this.array = array;
    this.index = index;
  }
  compile(){
    let index = this.index.compile();
    if (index.constructor.name === 'ConstantNode' && index.type === 'number'){
      let selection = this.array.values[index.value];
      if (selection){
        return selection.compile();
      }
    }
    return new IndexNode({
      array: this.array.compile(),
      index: this.index.compile(),
    });
  }
  toString(){
    return `${this.array.toString()}[${this.index.toString()}]`;
  }
}
