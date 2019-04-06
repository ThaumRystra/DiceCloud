export default class ParseNode {
  // Compiling a node must return a ConstantNode
  compile(){
    throw new Meteor.Error('Compile not implemented on ' + this);
  }
	// Compile, but turn rolls into arrays
  roll(){
    return this.compile();
  }
	// Compile, turn rolls into arrays, and reduce those arrays into single values
	reduce(){
		return this.compileAndRoll()
	}
}
