import aggregate from './computeVariable/aggregate/index.js';

export default function computeContainer(computation, node){
  if (!node.data) node.data = {};
  aggregateLinks(computation, node);
}

function aggregateLinks(computation, node){
  computation.dependencyGraph.forEachLinkedNode(
    node.id,
    (linkedNode, link) => {
      if (!linkedNode.data) linkedNode.data = {};
      // Ignore inactive props
      if (linkedNode.data.inactive) return;
      // Aggregate inventory links
      aggregate.inventory({node, linkedNode, link});
    },
    true // enumerate only outbound links
  );
}
