import ParseNode from '/imports/parser/parseTree/ParseNode.js';
import ArrayNode from '/imports/parser/parseTree/ArrayNode.js';
import ErrorNode from '/imports/parser/parseTree/ErrorNode.js';

export default class IndexNode extends ParseNode {
  constructor({array, index}) {
		super(...arguments);
    this.array = array;
    this.index = index;
  }
  resolve(fn, scope, context){
    let index = this.index[fn](scope, context);
    let array = this.array[fn](scope, context);

    if (index.isInteger && array instanceof ArrayNode){
      if (index.value < 1 || index.value > array.values.length){
        if (context){
          context.storeError({
            type: 'warning',
            message: `Index of ${index.value} is out of range for an array` +
              ` of length ${array.values.length}`,
          });
        }
      }
      let selection = array.values[index.value - 1];
      if (selection){
        let result = selection[fn](scope, context);
        return result;
      }
    } else if (fn === 'reduce'){
      if (!(array instanceof ArrayNode)){
        return new ErrorNode({
          node: this,
          error: 'Can not get the index of a non-array node: ' +
            this.array.toString() + ' = ' + array.toString(),
          context,
        });
      } else if (!index.isInteger){
        return new ErrorNode({
          node: this,
          error: array.toString() + ' is not an integer index of the array',
          context,
        });
      }
    }
    return new IndexNode({
      index,
      array,
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
