import computeCalculations from '/imports/api/creature/computation/newEngine/computeComputation/computeCalculations.js';
import computeToggles from '/imports/api/creature/computation/newEngine/computeComputation/computeToggles.js';
import computeByType from '/imports/api/creature/computation/newEngine/computeComputation/computeByType.js';

export default function computeCreatureComputation(computation){
  const stack = [];
  // dict of computed nodes by id
  const scope = {};
  const graph = computation.dependencyGraph;
  // Add all nodes to the stack
  graph.forEachNode(node => stack.push({
    node,
    visited: false,
    visitedChildren: false,
  }));
  // Depth first traversal of nodes
  while (stack.length){
    let top = stack[stack.length - 1];
    if (top.visited){
      // The object has already been computed, skip
      stack.pop();
    } else if (top.visitedChildren){
      // Compute the top object of the stack
      compute(graph, top.node, scope);
      // Mark the object as visited and remove from stack
      top.visited = true;
      stack.pop();
    } else {
      // Push dependencies to graph to be computed first
      pushDependenciesToStack(top.node.id, graph, stack);
      top.visitedChildren = true;
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
  graph.forEachLinkedNode(
    nodeId,
    (linkedNode, link) => {
      // Ignore inventory links, they are already fully computed when they are
      // created
      if (link.data === 'inventory' || link.data === 'classLevel') return;
      stack.push({
        node: linkedNode,
        visited: false,
        visitedChildren: false,
      });
    },
    true // enumerate only outbound links
  );
}
