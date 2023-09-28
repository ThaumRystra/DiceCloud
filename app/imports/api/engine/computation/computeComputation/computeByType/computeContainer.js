import aggregate from './computeVariable/aggregate/index';
import { safeStrip } from '/imports/api/engine/computation/utility/stripFloatingPointOddities';

export default function computeContainer(computation, node) {
  if (!node.data) node.data = {};
  aggregateLinks(computation, node);

  // Clean up floating points
  const prop = node.data;
  prop.contentsWeight = safeStrip(prop.contentsWeight);
  prop.carriedWeight = safeStrip(prop.carriedWeight);
}

function aggregateLinks(computation, node) {
  computation.dependencyGraph.forEachLinkedNode(
    node.id,
    (linkedNode, link) => {
      if (!linkedNode.data) linkedNode.data = {};
      // Ignore inactive props
      if (linkedNode.data.inactive) return;
      // Aggregate inventory links
      aggregate.inventory({ node, linkedNode, link });
    },
    true // enumerate only outbound links
  );
}
