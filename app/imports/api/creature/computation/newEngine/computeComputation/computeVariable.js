import aggregate from '/imports/api/creature/computation/newEngine/computeComputation/aggregateProps/index.js';

export default function computeVariable(graph, node){
  if (!node.data) node.data = {};
  aggregateLinks(graph, node);
}

function aggregateLinks(graph, node){
  let definingProp;
  let overridenProps = [];
  graph.forEachLinkedNode(
    node.id,
    (linkedNode, link) => {
      if (!linkedNode.data) linkedNode.data = {};
      // Ignore inactive props
      if (linkedNode.data.inactive) return;
      // Apply all the aggregations
      let arg = {node, linkedNode, link};
      aggregate.definitions(arg);
      aggregate.baseValue(arg);
      aggregate.damageMultipliers(arg);
      aggregate.effects(arg);
      aggregate.proficiencies(arg);
      aggregate.skills(arg);
      aggregate.toggles(arg);
    },
    true // enumerate only outbound links
  );
  // store the defining and overriden props on the node
  if (!node.data) node.data = {};
  node.data.definingProp = definingProp;
  node.data.overridenProps = overridenProps;
}
