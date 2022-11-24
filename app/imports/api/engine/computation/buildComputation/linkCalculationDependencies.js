import findAncestorByType from '/imports/api/engine/computation/utility/findAncestorByType.js';
import { traverse } from '/imports/parser/resolve.js';

export default function linkCalculationDependencies(dependencyGraph, prop, { propsById }) {
  prop._computationDetails.calculations.forEach(calcObj => {
    // Store resolved ancestors
    const memo = {
      // ancestors: {} //this gets added if there are resolved ancestors
    };
    // Add this calculation to the dependency graph
    const calcNodeId = `${prop._id}.${calcObj._key}`;
    dependencyGraph.addNode(calcNodeId, calcObj);

    // Traverse the parsed calculation looking for variable names
    traverse(calcObj.parseNode, node => {
      // Skip nodes that aren't symbols or accessors
      if (node.parseType !== 'symbol' && node.parseType !== 'accessor') return;
      // Link ancestor references as direct property dependencies
      if (node.name[0] === '#') {
        let ancestorProp = getAncestorProp(
          node.name.slice(1), memo, prop, propsById
        );
        if (!ancestorProp) return;
        // Link the ancestor prop as a direct dependency
        // TODO: we might be referencing a calculation sub-field, depend on that instead
        dependencyGraph.addLink(
          calcNodeId, ancestorProp._id, 'ancestorReference'
        );
      } else {
        // Link variable name references as variable dependencies
        dependencyGraph.addLink(
          calcNodeId, node.name, 'variableReference'
        );
      }
    });
    // Store the resolved ancestors in this calculation's local scope
    if (memo.ancestors) {
      calcObj._localScope = { ...calcObj._localScope, ...memo.ancestors };
    }
  });
}

function getAncestorProp(type, memo, prop, propsById) {
  if (memo.ancestors && memo.ancestors['#' + type]) {
    return memo.ancestors['#' + type];
  } else {
    var ancestorProp = findAncestorByType(prop, type, propsById);
    if (!memo.ancestors) memo.ancestors = {};
    memo.ancestors['#' + type] = ancestorProp;
    return ancestorProp;
  }
}
