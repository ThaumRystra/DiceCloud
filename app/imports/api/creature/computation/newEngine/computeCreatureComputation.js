import evaluateCalculation from '/imports/api/creature/computation/newEngine/computeComputation/evaluateCalculation.js';
import computeVariable from '/imports/api/creature/computation/newEngine/computeComputation/computeVariable.js';

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
      // The object has already
      stack.pop();
    } else if (top.visitedChildren){
      // Compute the top object of the stack
      compute(graph, top.node, scope);
      // If the node holds a variable, store it in the scope
      if (!top.node.data?.type){
        scope[top.node.id] = top.node.data;
      }
      // Mark the object as visited and remove from stack
      top.visited = true;
      stack.pop();
    } else {
      // Push children to graph
      pushDependenciesToStack(top.node.id, graph, stack);
      top.visitedChildren = true;
    }
  }
}

function compute(graph, node, scope){
  // Get the property
  let prop = node.data;

  // evaluate all the calculations
  if (prop?._computationDetails?.calculations){
    prop._computationDetails.calculations.forEach(calcObj => {
      evaluateCalculation(calcObj, scope)
    });
  }

  // Compute the property by type
  let typeCompute = propTypeComputations[prop?.type || '_variable'];
  typeCompute?.(graph, node);
}

var propTypeComputations = {
  '_variable': computeVariable,
};

function pushDependenciesToStack(nodeId, graph, stack){
  graph.forEachLinkedNode(
    nodeId,
    (linkedNode, link) => {
      // Ignore inventory links, they can't cause dependency loops
      // and are already fully computed when they are created
      if (link.data === 'inventory') return;
      stack.push({
        node: linkedNode,
        visited: false,
        visitedChildren: false,
      });
    },
    true // enumerate only outbound links
  );
}
