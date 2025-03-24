import computeToggles from '/imports/api/engine/computation/computeComputation/computeToggles';
import computeByType from '/imports/api/engine/computation/computeComputation/computeByType';
import embedInlineCalculations from './utility/embedInlineCalculations';
import { removeEmptyCalculations } from './buildComputation/parseCalculationFields';
import path from 'ngraph.path';
import type CreatureComputation from './CreatureComputation';
import type { Graph, Node, NodeId } from 'ngraph.graph';

type TraversedNode = Node<any> & {
  _visited?: boolean,
  _visitedChildren?: boolean,
}

export default async function computeCreatureComputation(computation: CreatureComputation) {
  const stack: (TraversedNode)[] = [];
  // Computation scope of {variableName: prop}
  const graph = computation.dependencyGraph;
  // Add all nodes to the stack
  graph.forEachNode((node: TraversedNode) => {
    node._visited = false;
    node._visitedChildren = false;
    stack.push(node)
  });

  // The graph nodes in the stack are ordered, by reversing the order we
  // compute higher nodes in the tree first, which for dep loops is more likely
  // to be a good guess of where to start thant the inverse
  stack.reverse();

  // Depth first traversal of nodes
  while (stack.length) {
    const top = stack[stack.length - 1];
    if (top._visited) {
      // The object has already been computed, skip
      stack.pop();
    } else if (top._visitedChildren) {
      // Mark the object as visited and remove from stack
      top._visited = true;
      stack.pop();
      // Compute the top object of the stack
      await compute(computation, top);
    } else {
      top._visitedChildren = true;
      // Push dependencies to graph to be computed first
      pushDependenciesToStack(top.id, graph, stack, computation);
    }
  }

  // Finish the props after the dependency graph has been traversed
  for (const prop of computation.props) {
    finalizeProp(prop);
  }
}

async function compute(computation: CreatureComputation, node: TraversedNode) {
  // Determine the prop's active status by its toggles
  computeToggles(computation, node);
  // Compute the property by type
  await computeByType[node.data?.type || '_variable']?.(computation, node);
}

function pushDependenciesToStack(nodeId: NodeId, graph: Graph, stack: TraversedNode[], computation: CreatureComputation) {
  graph.forEachLinkedNode(nodeId, (linkedNode: TraversedNode) => {
    if (linkedNode._visitedChildren && !linkedNode._visited) {
      // This is a dependency loop, find a path from the node to itself
      // and store that path as a dependency loop error
      const pather = path.nba(graph, { oriented: true });
      const loop: TraversedNode[] = [];
      // Pather doesn't like going from a node to itself, so find all the
      // paths going from the next node back to the original node
      // and return the shortest one
      graph.forEachLinkedNode(nodeId, nextNode => {
        const newLoop = pather.find(nextNode.id, nodeId);
        if (!newLoop.length) return;
        if (!loop.length || newLoop.length < loop.length - 1) {
          loop = [linkedNode, ...newLoop];
        }
      }, true);

      if (loop.length) {
        computation.errors.push({
          type: 'dependencyLoop',
          details: {
            nodes: loop.map(node => node.id)
          },
        });
      }
    }
    stack.push(linkedNode);
  }, true);
}

function finalizeProp(prop) {
  // Embed the inline calculations
  prop._computationDetails?.inlineCalculations?.forEach(inlineCalcObj => {
    embedInlineCalculations(inlineCalcObj);
  });
  // Clean up the calculations that were never used
  removeEmptyCalculations(prop);
  // Clean up the computation details
  delete prop._computationDetails;
}
