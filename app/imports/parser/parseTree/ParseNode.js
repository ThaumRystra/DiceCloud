export default class ParseNode {
  constructor({previousNodes, detail}){
    this.inheritDetails(previousNodes);
    if (detail) this.pushDetails([detail]);
  }
  inheritDetails(nodes){
    if (!nodes || !nodes.length) return;
    nodes.forEach(node => this.pushDetails(node.details));
  }
  pushDetails(details){
    if (!details || !details.length) return;
    if (!this.details) this.details = [];
    details.forEach(detail => this.details.push(detail));
  }
  compile(){
    // Returns a ParseNode, a ConstantNode if possible
    throw new Meteor.Error('Compile not implemented on ' + this.constructor.name);
  }
  toString(){
    throw new Meteor.Error('toString not implemented on ' + this.constructor.name);
  }
	// Compile, but turn rolls into arrays
  roll(scope){
    return this.compile(scope);
  }
	// Compile, turn rolls into arrays, and reduce those arrays into single values
	reduce(scope){
		return this.roll(scope);
	}
}
