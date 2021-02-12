import ParseNode from '/imports/parser/parseTree/ParseNode.js';

export default class ErrorNode extends ParseNode {
  constructor({node, error, context}) {
		super(...arguments);
    this.node = node;
    this.error = error;
    if (context){
      context.storeError({
        type: 'error',
        message: error,
      });
    }
  }
  compile(){
    return this;
  }
  toString(){
    return this.error.toString();
  }
}
