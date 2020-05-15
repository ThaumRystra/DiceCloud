import math from '/imports/math.js';

export default function bareSymbolSubtitutor(scope){
  return function(node, path){
    if (!scope) return node;
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
      let stat = scope[node.name];
      if (!stat) return node;
      return new math.ConstantNode(stat.value);
    } else {
      return node;
    }
  }
}
