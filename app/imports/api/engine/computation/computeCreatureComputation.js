import computeCalculations from '/imports/api/engine/computation/computeComputation/computeCalculations.js';
import computeToggles from '/imports/api/engine/computation/computeComputation/computeToggles.js';
import computeByType from '/imports/api/engine/computation/computeComputation/computeByType.js';

export default function computeCreatureComputation(computation){
  const stack = [];
  // Computation scope of {variableName: prop}
  const graph = computation.dependencyGraph;
  // Add all nodes to the stack
  graph.forEachNode(node => {
    node._visited = false;
    node._visitedChildren = false;
    stack.push(node)
  });
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
      compute(computation, top);
    } else {
      top._visitedChildren = true;
      // Push dependencies to graph to be computed first
      pushDependenciesToStack(top.id, graph, stack);
    }
  }
}

function compute(computation, node){
  // Determine the prop's active status by its toggles
  computeToggles(computation, node);
  computeCalculations(computation, node);
  if (node.data) delete node.data._computationDetails;
  // Compute the property by type
  computeByType[node.data?.type || '_variable']?.(computation, node);
}

function pushDependenciesToStack(nodeId, graph, stack){
  graph.forEachLinkedNode(nodeId, linkedNode => {
    stack.push(linkedNode);
  }, true);
}
