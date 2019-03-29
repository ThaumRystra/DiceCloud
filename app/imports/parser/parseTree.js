// All the classes that make up a parse tree

class ParseNode {
  // Compiling a node must return a ConstantNode
  compile(){
    throw new Meteor.Error('Compile not implemented on ' + this);
  }
  compileToSingleValue(){
    return this.compile();
  }
}

function sum(total, num) {
  return total + num;
}

class ConstantNode extends ParseNode {
  constructor({value, type, errors}){
    // string, number, boolean, numberArray, uncompiledNode
    this.type = type;
    this.value = value;
    if (errors) this.errors = errors;
  }
  compile(){
    return this;
  }
  compileToSingleValue(){
    if (this.type !== 'numberArray') return this;
    return this.value.reduce(sum, 0);
  }
}

class SymbolNode extends ParseNode {
  constructor({name}){
    this.name = name;
  }
  compile(scope){
    let value = scope[this.name];
    let type = typeof value;
    if (type === 'string' || type === 'number' || type === 'boolean'){
      return new ConstantNode({value, type});
    } else if (type === 'undefined'){
      return new ConstantNode({
        value: this.name,
        type: 'uncompiledNode',
        errors: [`${this.name} could not be resolved`]
      });
    } else {
      throw new Meteor.Error(`Unexpected case: ${this.name} resolved to ${value}`);
    }
  }
}

class ifNode extends ParseNode {
  constructor({condition, consequent, alternative}){
    this.condition = condition;
    this.consequent = consequent;
    this.alternative = alternative;
  }
  compile(){
    let condition = this.condition.compile();
    let consequent = this.consequent.compile();
    let alternative = this.alternative.compile();
    if (
      condition.type === 'uncompiledNode' ||
      consequent.type === 'uncompiledNode' ||
      alternative.type === 'uncompiledNode'
    ){
      // Handle uncompiled child nodes
      return new ConstantNode({
        value: `if (${condition.value}) ${consequent.value} else ${alternative.value}`,
        type: 'uncompiledNode',
        errors: [
          ...condition.errors,
          ...consequent.errors,
          ...alternative.errors,
        ],
      });
    } else {
      if (condition.value){
        return consequent;
      } else {
        return alternative;
      }
    }
  }
}

class OperatorNode extends ParseNode {
  constructor({left, right, operator, fn}) {
    this.left = left;
    this.right = right;
    this.fn = fn;
    this.operator = operator;
  }
}
