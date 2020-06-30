import math from '/imports/math.js';

const diceRegex = /d\d+/;

export default function substituteRollsWithFunctions(node){
  // TODO also replace dx as 1dx
  if (
    node.isOperatorNode &&
    node.fn === 'multiply' &&
    node.implicit &&
    node.args[1].isSymbolNode &&
    diceRegex.test(node.args[1].name)
  ){
    let diceSize = node.args[1].name.slice(1);
    let diceSizeNode = new math.ConstantNode(diceSize);
    return new math.FunctionNode('roll', [node.args[0], diceSizeNode]);
  } else if (
    node.isSymbolNode &&
    diceRegex.test(node.name)
  ) {
    let diceSize = node.name.slice(1);
    let diceSizeNode = new math.ConstantNode(diceSize);
    let diceNumberNode = new math.ConstantNode(1);
    return new math.FunctionNode('roll', [diceNumberNode, diceSizeNode]);
  } else {
    return node;
  }
}
