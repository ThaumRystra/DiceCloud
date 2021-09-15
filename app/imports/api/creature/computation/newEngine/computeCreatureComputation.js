import computeCalculations from '/imports/api/creature/computation/newEngine/computeComputation/computeCalculations.js';
import computeToggles from '/imports/api/creature/computation/newEngine/computeComputation/computeToggles.js';
import computeByType from '/imports/api/creature/computation/newEngine/computeComputation/computeByType.js';

export default function computeCreatureComputation(computation){
  const stack = [];
  // Computation scope of {variableName: prop}
  const scope = {};
  const graph = computation.dependencyGraph;
  // Add all nodes to the stack
  graph.forEachNode(node => stack.push(node));
  // Depth first traversal of nodes
  while (stack.length){
    let top = stack[stack.length - 1];
    if (top._visited){
      // The object has already been computed, skip
      stack.pop();
    } else if (top._visitedChildren){
      // Mark the object as visited and remove from stack
      top._visited = true;
      stack.pop();
      // Compute the top object of the stack
      compute(graph, top, scope);
    } else {
      top._visitedChildren = true;
      // Push dependencies to graph to be computed first
      pushDependenciesToStack(top.id, graph, stack);
    }
  }
}

function compute(graph, node, scope){
  // Determine the prop's active status by its toggles
  computeToggles(node);
  computeCalculations(node, scope);
  // Compute the property by type
  computeByType[node.data?.type || '_variable']?.(graph, node, scope);
}

function pushDependenciesToStack(nodeId, graph, stack){
  graph.forEachLinkedNode(nodeId, linkedNode => stack.push(linkedNode), true);
}
