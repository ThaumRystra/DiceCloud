export default class ParseNode {
  toString(){
    throw new Meteor.Error('toString not implemented on ' + this.constructor.name);
  }
  compile(scope, context){
    // Returns a ParseNode, a ConstantNode if possible
    if(this.resolve) {
      return this.resolve('compile', scope, context);
    } else {
      throw new Meteor.Error('Compile not implemented on ' + this.constructor.name);
    }
  }
	// Compile, but turn rolls into arrays
  roll(scope, context){
    if (this.resolve){
      return this.resolve('roll', scope, context);
    } else {
      return this.compile(scope, context);
    }
  }
	// Compile, turn rolls into arrays, and reduce those arrays into single values
	reduce(scope, context){
    if (this.resolve){
      return this.resolve('reduce', scope, context);
    } else {
      return this.roll(scope, context);
    }
	}
  // If traverse isn't implemented, just apply it to the current node
  traverse(fn){
    fn(this);
  }
  // replace nodes, only replace nodes if fn returns a value
  replaceNodes(fn){
    let newNode = fn(this);
    if (newNode) {
      return newNode;
    } else {
      if (this.replaceChildren) this.replaceChildren(fn)
      return this;
    }
  }
}
