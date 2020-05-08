import * as math from 'mathjs';

export default function replaceBareSymbolsWithValueAccessor(node, path) {
  if (node.isFunctionNode){
    let fn = node.fn;
    if (fn && fn.isSymbolNode){
      fn.skipReplacement = true;
    }
    return node;
  } else if (
    node.isSymbolNode &&
    path !== 'object' &&
    node.skipReplacement !== true
  ) {
    const object = new math.SymbolNode(node.name);
    const address = new math.ConstantNode('value');
    const index = new math.IndexNode([address]);
    return new math.AccessorNode(object, index);
  } else {
    return node;
  }
}
