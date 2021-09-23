import aggregate from './computeVariable/aggregate/index.js';

export default function computeContainer(graph, node){
  if (!node.data) node.data = {};
  aggregateLinks(graph, node);
}

function aggregateLinks(graph, node){
  graph.forEachLinkedNode(
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
