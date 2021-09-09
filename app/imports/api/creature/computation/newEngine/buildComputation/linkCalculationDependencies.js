import SymbolNode from '/imports/parser/parseTree/SymbolNode.js';
import AccessorNode from '/imports/parser/parseTree/AccessorNode.js';
import findAncestorByType from 'imports/api/creature/computation/newEngine/utility/findAncestorByType.js';

export default function linkCalculationDependencies(dependencyGraph, prop, propsById){
  prop._computationDetails.calculations.forEach(calcObj => {
    // Traverse the parsed calculation looking for variable names
    calcObj._parsedCalculation.travese(node => {
      if (node instanceof SymbolNode || node instanceof AccessorNode){
        // Link ancestor references as direct property dependencies
        if (node.name[0] === '#'){
          let ancestorProp = findAncestorByType(
            prop, node.name.slice(1), propsById
          );
          if (!ancestorProp) return;
          dependencyGraph.addLink(prop._id, ancestorProp._id, calcObj);
        } else {
          // Link variable name references as variable dependencies
          dependencyGraph.addLink(prop._id, node.name, calcObj);
        }
      }
    });
  });
}
