import ParseNode from '/imports/parser/parseTree/ParseNode.js';

export default class IndexNode extends ParseNode {
  constructor({array, index}) {
		super(...arguments);
    this.array = array;
    this.index = index;
  }
  resolve(fn, scope, context){
    let index = this.index[fn](scope, context);
    if (index.isInteger){
      let selection = this.array.values[index.value - 1];
      if (selection){
        let result = selection[fn](scope, context);
        return result;
      }
    }
    return new IndexNode({
      index,
      array: this.array[fn](scope, context),
      previousNodes: [this],
    });
  }
  toString(){
    return `${this.array.toString()}[${this.index.toString()}]`;
  }
  traverse(fn){
    fn(this);
    this.array.traverse(fn);
    this.index.traverse(fn);
  }
  replaceChildren(fn){
    this.array = this.array.replaceNodes(fn);
    this.index = this.index.replaceNodes(fn);
  }
}
