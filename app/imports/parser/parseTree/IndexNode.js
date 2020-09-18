import ParseNode from '/imports/parser/parseTree/ParseNode.js';

export default class IndexNode extends ParseNode {
  constructor({array, index}) {
		super(...arguments);
    this.array = array;
    this.index = index;
  }
  resolve(fn, scope){
    let index = this.index[fn](scope);
    if (index.isInteger){
      let selection = this.array.values[index.value - 1];
      if (selection){
        let result = selection[fn](scope);
        result.inheritDetails([index, this]);
        return result;
      }
    }
    return new IndexNode({
      array: this.array[fn](scope),
      index: this.index[fn](scope),
      previousNodes: [this],
    });
  }
  toString(){
    return `${this.array.toString()}[${this.index.toString()}]`;
  }
}
