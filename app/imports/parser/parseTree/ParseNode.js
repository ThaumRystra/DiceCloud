export default class ParseNode {
  compile(){
    // Returns a ParseNode, a ConstantNode if possible
    throw new Meteor.Error('Compile not implemented on ' + this.constructor.name);
  }
  toString(){
    throw new Meteor.Error('toString not implemented on ' + this.constructor.name);
  }
	// Compile, but turn rolls into arrays
  roll(){
    return this.compile();
  }
	// Compile, turn rolls into arrays, and reduce those arrays into single values
	reduce(){
		return this.roll();
	}
}
