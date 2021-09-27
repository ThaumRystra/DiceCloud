import SymbolNode from '/imports/parser/parseTree/SymbolNode.js';
import AccessorNode from '/imports/parser/parseTree/AccessorNode.js';
import findAncestorByType from '/imports/api/engine/computation/utility/findAncestorByType.js';

export default function linkCalculationDependencies(dependencyGraph, prop, {propsById}){
  prop._computationDetails.calculations.forEach(calcObj => {
    // Store resolved ancestors
    let memo = {
      // ancestors: {} //this gets added if there are resolved ancestors
    };
    // Traverse the parsed calculation looking for variable names
    calcObj._parsedCalculation.traverse(node => {
      // Skip nodes that aren't symbols or accessors
      if (!(node instanceof SymbolNode || node instanceof AccessorNode)) return;
      // Link ancestor references as direct property dependencies
      if (node.name[0] === '#'){
        let ancestorProp = getAncestorProp(
          node.name.slice(1), memo, prop, propsById
        );
        if (!ancestorProp) return;
        dependencyGraph.addLink(prop._id, ancestorProp._id, calcObj);
      } else {
        // Link variable name references as variable dependencies
        dependencyGraph.addLink(prop._id, node.name, calcObj);
      }
    });
    // Store the resolved ancestors in this calculation's local scope
    if (memo.ancestors) {
      calcObj._localScope = { ...calcObj._localScope, ...memo.ancestors};
    }
  });
}

function getAncestorProp(type, memo, prop, propsById){
  if (memo.ancestors && memo.ancestors['#' + type]){
    return memo.ancestors['#' + type];
  } else {
    var ancestorProp = findAncestorByType( prop, type, propsById );
    if (!memo.ancestors) memo.ancestors = {};
    memo.ancestors['#' + type] = ancestorProp;
    return ancestorProp;
  }
}
